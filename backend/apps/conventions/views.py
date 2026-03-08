from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import FileResponse

from .models import Convention
from .serializers import ConventionSerializer
from apps.api.permissions import IsOwnerOrAdmin

def get_client_ip(request):
    """Récupère l'IP du client"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

import json
from webauthn import verify_authentication_response, base64url_to_bytes
from webauthn.helpers.structs import AuthenticationCredential
from apps.accounts.models import WebauthnAuthentication, WebauthnCredential

def verify_webauthn_for_user(request, user, webauthn_data):
    try:
        auth = WebauthnAuthentication.objects.get(user=user)
    except WebauthnAuthentication.DoesNotExist:
        return False, "No authentication challenge found."

    try:
        credential = AuthenticationCredential.parse_raw(json.dumps(webauthn_data))
    except Exception:
        return False, "Invalid WebAuthn response structure."

    cred_obj = WebauthnCredential.objects.filter(user=user, credential_id=credential.id).first()
    if not cred_obj:
        return False, "WebAuthn credential not found for this user."

    rp_id = request.get_host().split(':')[0]
    expected_origin = f"http://{request.get_host()}"
    if '127.0.0.1' in expected_origin or 'localhost' in expected_origin:
        expected_origin = [f"http://{request.get_host()}", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]

    try:
        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(auth.challenge),
            expected_rp_id=rp_id,
            expected_origin=expected_origin,
            credential_public_key=base64url_to_bytes(cred_obj.public_key) if isinstance(cred_obj.public_key, str) else cred_obj.public_key,
            credential_current_sign_count=cred_obj.sign_count,
        )
        
        if hasattr(verification, 'json'):
            verification_dict = json.loads(verification.json())
            cred_obj.sign_count = verification_dict.get("new_sign_count", cred_obj.sign_count + 1)
        elif hasattr(verification, 'new_sign_count'):
            cred_obj.sign_count = verification.new_sign_count
        else:
            cred_obj.sign_count += 1
            
        cred_obj.save()
        return True, cred_obj.credential_id
    except Exception as e:
        return False, str(e)

class ConventionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Conventions.
    """
    serializer_class = ConventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset based on user role.
        """
        user = self.request.user
        qs = Convention.objects.all()

        if user.role == 'student':
            # Students see their own conventions
            if hasattr(user, 'student_profile'):
                qs = qs.filter(student=user.student_profile)
            else:
                qs = qs.none()
        elif user.role == 'company':
            # Companies see conventions linked to their profile
            if hasattr(user, 'company_profile'):
                qs = qs.filter(company=user.company_profile)
            else:
                qs = qs.none()
        elif user.role == 'admin':
            # Admins see all conventions
            pass
        else:
            qs = qs.none()
            
        return qs

    def get_permissions(self):
        """
        Apply IsOwnerOrAdmin for retrieve and download actions.
        """
        if self.action in ['retrieve', 'download', 'status', 'history']:
            self.permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
        return super().get_permissions()

    def check_object_permissions(self, request, obj):
        """
        Custom check for IsOwnerOrAdmin mapping.
        In IsOwnerOrAdmin, we check if obj.user == request.user or obj.company.user == request.user.
        For conventions, owner applies to both the linked student and company.
        """
        if request.user.role == 'admin':
            return True
            
        if request.user.role == 'student' and obj.student.user == request.user:
            return True
            
        if request.user.role == 'company' and obj.company.user == request.user:
            return True
            
        self.permission_denied(
            request, message="You do not have permission to access this convention."
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Download the convention PDF file.
        """
        convention = self.get_object()
        
        if not convention.pdf_file:
            return Response(
                {"detail": "No PDF file available for this convention."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Ensure we read the file correctly depending on storage backend.
        # Simple file handling for standard FileSystemStorage
        try:
            file_handle = convention.pdf_file.open('rb')
            response = FileResponse(file_handle, content_type='application/pdf')
            # Suggest a filename
            filename = f"convention_{convention.id}_{convention.student.first_name}_{convention.student.last_name}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except FileNotFoundError:
             return Response(
                {"detail": "PDF file not found on server."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='sign-student')
    def sign_student(self, request, pk=None):
        """
        POST /api/conventions/<id>/sign-student/
        """
        convention = self.get_object()
        
        if request.user.role != 'student' or convention.student.user != request.user:
            return Response(
                {'error': 'Only the student can sign this convention'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if convention.status != 'pending_student_signature':
            return Response(
                {
                    'error': f'Cannot sign at this stage. Current status: {convention.status}',
                    'current_status': convention.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if convention.student_signed:
            return Response(
                {'error': 'Convention already signed by student'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.data.get('confirmed'):
            return Response(
                {'error': 'You must confirm the terms before signing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        webauthn_response = request.data.get('webauthn_response')
        if not webauthn_response:
            return Response(
                {'error': 'Fingerprint authentication data (webauthn_response) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
        if not is_valid:
            return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        from apps.conventions.services.convention_service import ConventionService
        
        convention.student_signed = True
        convention.student_signed_at = timezone.now()
        convention.student_fingerprint_authenticated = True
        convention.student_authentication_timestamp = str(timezone.now().timestamp())
        convention.student_credential_id = result_or_error
        convention.student_ip_address = get_client_ip(request)
        convention.student_user_agent = request.META.get('HTTP_USER_AGENT', '')
        convention.status = 'pending_company_signature'
        convention.save()
        
        ConventionService.regenerate_pdf(convention)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_student_signed(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': 'Convention signed successfully with Fingerprint',
            'convention': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='sign-company')
    def sign_company(self, request, pk=None):
        """
        POST /api/conventions/<id>/sign-company/
        """
        convention = self.get_object()
        
        if request.user.role != 'company' or convention.company.user != request.user:
            return Response(
                {'error': 'Only the company can sign this convention'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if convention.status != 'pending_company_signature':
            return Response(
                {
                    'error': f'Cannot sign at this stage. Current status: {convention.status}',
                    'current_status': convention.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if convention.company_signed:
            return Response(
                {'error': 'Convention already signed by company'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.data.get('confirmed'):
            return Response(
                {'error': 'You must confirm the terms before signing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        webauthn_response = request.data.get('webauthn_response')
        if not webauthn_response:
            return Response(
                {'error': 'Fingerprint authentication data (webauthn_response) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
        if not is_valid:
            return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        from apps.conventions.services.convention_service import ConventionService
        
        convention.company_signed = True
        convention.company_signed_at = timezone.now()
        convention.company_fingerprint_authenticated = True
        convention.company_authentication_timestamp = str(timezone.now().timestamp())
        convention.company_credential_id = result_or_error
        convention.company_ip_address = get_client_ip(request)
        convention.company_user_agent = request.META.get('HTTP_USER_AGENT', '')
        convention.status = 'pending_admin_validation'
        convention.save()
        
        ConventionService.regenerate_pdf(convention)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_company_signed(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': 'Convention signed successfully with Fingerprint',
            'convention': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='validate', permission_classes=[permissions.IsAdminUser])
    def validate_convention(self, request, pk=None):
        """
        POST /api/conventions/<id>/validate/
        """
        convention = self.get_object()
        
        if convention.status != 'pending_admin_validation':
            return Response(
                {
                    'error': f'Cannot validate at this stage. Current status: {convention.status}',
                    'current_status': convention.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if convention.admin_signed:
            return Response(
                {'error': 'Convention already validated'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.data.get('confirmed'):
            return Response(
                {'error': 'You must confirm before validating'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        webauthn_response = request.data.get('webauthn_response')
        if not webauthn_response:
            return Response(
                {'error': 'Fingerprint authentication data (webauthn_response) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
        if not is_valid:
            return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        from apps.conventions.services.convention_service import ConventionService
        
        convention.admin_signed = True
        convention.admin_signed_at = timezone.now()
        convention.admin_signed_by = request.user
        convention.admin_fingerprint_authenticated = True
        convention.admin_authentication_timestamp = str(timezone.now().timestamp())
        convention.admin_credential_id = result_or_error
        convention.admin_ip_address = get_client_ip(request)
        convention.admin_user_agent = request.META.get('HTTP_USER_AGENT', '')
        convention.status = 'validated'
        convention.save()
        
        ConventionService.regenerate_pdf(convention, final=True)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_validated(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': 'Convention validated successfully with Fingerprint',
            'convention': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_convention(self, request, pk=None):
        """
        POST /api/conventions/<id>/reject/
        Admin rejection.
        """
        convention = self.get_object()
        
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only the admin can reject'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        reason = request.data.get('reason', 'No reason provided')
        
        from apps.conventions.services.convention_service import ConventionService
        success = ConventionService.reject_convention(convention, request.user, reason)
        
        if success:
            from apps.notifications.services import NotificationService
            NotificationService.notify_convention_rejected(convention, reason)
            convention.refresh_from_db()
            serializer = self.get_serializer(convention)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Rejection failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Lightweight endpoint returning only the convention status.
        GET /api/conventions/<id>/status/
        """
        convention = self.get_object()
        return Response({
            "id": convention.id,
            "status": convention.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Lightweight endpoint returning the signature history and timestamps.
        GET /api/conventions/<id>/history/
        """
        convention = self.get_object()
        return Response({
            "id": convention.id,
            "status": convention.status,
            "history": convention.get_signature_status()
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        """
        GET /api/conventions/pending/
        
        List conventions awaiting admin validation.
        """
        qs = Convention.objects.filter(status='pending_admin_validation')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        """
        GET /api/conventions/stats/
        
        Get statistics on conventions for the admin dashboard.
        """
        from django.db.models import Count
        stats = Convention.objects.values('status').annotate(count=Count('status'))
        
        # Format the result nicely
        result = {item['status']: item['count'] for item in stats}
        result['total'] = Convention.objects.count()
        
        return Response(result, status=status.HTTP_200_OK)
