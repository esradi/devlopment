from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import FileResponse

from .models import Convention
from .serializers import ConventionSerializer
from apps.api.permissions import IsOwnerOrAdmin

def get_client_ip(request):
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
        # Try parse_raw for pydantic v1, or model_validate for v2
        if hasattr(AuthenticationCredential, 'parse_raw'):
            credential = AuthenticationCredential.parse_raw(json.dumps(webauthn_data))
        else:
            credential = AuthenticationCredential.model_validate(webauthn_data)
    except Exception as e:
        return False, f"Invalid WebAuthn response structure: {str(e)}"

    cred_obj = WebauthnCredential.objects.filter(user=user, credential_id=credential.id).first()
    if not cred_obj:
        return False, "WebAuthn credential not found for this user."

    rp_id = request.get_host().split(':')[0]
    expected_origin = [
        f"http://{request.get_host()}", 
        "http://localhost:3000", "http://127.0.0.1:3000", 
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175"
    ]

    try:
        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=base64url_to_bytes(auth.challenge),
            expected_rp_id=rp_id,
            expected_origin=expected_origin,
            credential_public_key=base64url_to_bytes(cred_obj.public_key) if isinstance(cred_obj.public_key, str) else cred_obj.public_key,
            credential_current_sign_count=cred_obj.sign_count,
            require_user_verification=False
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
    serializer_class = ConventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Convention.objects.all()

        # If it's a download action with a verification code, we allow the queryset
        # and let check_object_permissions handle the actual security check.
        if self.action == 'download' and not user.is_authenticated:
            return qs

        if not user.is_authenticated:
            return qs.none()

        if user.role == 'student':
            if hasattr(user, 'student_profile'):
                qs = qs.filter(student=user.student_profile)
            else:
                qs = qs.none()
        elif user.role == 'company':
            if hasattr(user, 'company_profile'):
                qs = qs.filter(company=user.company_profile)
            else:
                qs = qs.none()
        elif user.role == 'admin':
            pass
        else:
            qs = qs.none()
            
        return qs

    def get_permissions(self):
        if self.action == 'download':
            # Allow public access to download via verification code or authenticated access
            return [permissions.AllowAny()]
        if self.action in ['retrieve', 'status', 'history']:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return super().get_permissions()

    def check_object_permissions(self, request, obj):
        # 1. Allow access via verification code (for public download)
        v_code = request.query_params.get('v')
        if v_code and obj.verification_code == v_code:
            return True
            
        # 2. Allow authenticated access
        if not request.user.is_authenticated:
            self.permission_denied(request, message="Authentication required or valid verification code needed.")

        if request.user.role == 'admin':
            return True
            
        if request.user.role == 'student' and obj.student.user == request.user:
            return True
            
        if request.user.role == 'company' and obj.company.user == request.user:
            return True
            
        self.permission_denied(
            request, message="You do not have permission to access this convention."
        )

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def download(self, request, pk=None):
        # We don't use get_object() here to bypass IsAuthenticated/IsOwner checks
        # because window.open() doesn't send Bearer tokens.
        # Instead, we verify via the unique code in the URL.
        convention = get_object_or_404(Convention, pk=pk)
        
        # Security: Check the verification code (support both 'code' and 'v' aliases)
        code = request.query_params.get('code') or request.query_params.get('v')
        
        # If user is NOT authenticated, they MUST provide a valid code
        if not request.user.is_authenticated:
            if not code or code != convention.verification_code:
                return Response(
                    {"detail": "Authentication credentials were not provided, and no valid verification code was found."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        # If user IS authenticated, we still verify they are the owner/admin unless they have the code
        elif code != convention.verification_code:
            # Re-check standard permissions
            if request.user.role == 'student' and convention.student.user != request.user:
                return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
            if request.user.role == 'company' and convention.company.user != request.user:
                return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        if not convention.pdf_file:
            return Response(
                {"detail": "No PDF file available for this convention."},
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            file_handle = convention.pdf_file.open('rb')
            response = FileResponse(file_handle, content_type='application/pdf')
            filename = f"convention_{convention.id}_{convention.student.first_name}_{convention.student.last_name}.pdf"
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except FileNotFoundError:
             return Response(
                {"detail": "PDF file not found on server."},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], url_path='force-regenerate', permission_classes=[permissions.IsAdminUser])
    def force_regenerate(self, request, pk=None):
        #POST /api/conventions/<id>/force-regenerate/
        convention = self.get_object()
        from .services.convention_service import ConventionService
        final_version = (convention.status == 'validated')
        ConventionService.regenerate_pdf(convention, final=final_version)
        return Response({'message': 'PDF regenerated successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='sign-student')
    def sign_student(self, request, pk=None):
        #POST /api/conventions/<id>/sign-student/
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
        
        # Check for manual signature fallback
        is_manual = request.data.get('manual', False)
        signature_image = request.data.get('signature_image', None)
        
        if not is_manual:
            webauthn_response = request.data.get('webauthn_response')
            if not webauthn_response:
                return Response(
                    {'error': 'Fingerprint authentication data (webauthn_response) is required or use manual:true'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
            if not is_valid:
                return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
            
            credential_id = result_or_error
            fingerprint_auth = True
        else:
            credential_id = "MANUAL_SIG"
            fingerprint_auth = False
        
        from django.utils import timezone
        from .services.convention_service import ConventionService
        
        convention.student_signed = True
        convention.student_signed_at = timezone.now()
        convention.student_fingerprint_authenticated = fingerprint_auth
        convention.student_authentication_timestamp = str(timezone.now().timestamp())
        convention.student_credential_id = credential_id
        convention.student_ip_address = get_client_ip(request)
        convention.student_user_agent = request.META.get('HTTP_USER_AGENT', '')
        if is_manual and signature_image:
            convention.student_signature_image = signature_image
            
        convention.status = 'pending_company_signature'
        convention.save()
        
        ConventionService.regenerate_pdf(convention)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_student_signed(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': f"Convention signed successfully with {'Fingerprint' if fingerprint_auth else 'Manual Signature'}",
            'convention': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='sign-company')
    def sign_company(self, request, pk=None):
        #POST /api/conventions/<id>/sign-company/
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
        
        # Check for manual signature fallback
        is_manual = request.data.get('manual', False)
        signature_image = request.data.get('signature_image', None)
        
        if not is_manual:
            webauthn_response = request.data.get('webauthn_response')
            if not webauthn_response:
                return Response(
                    {'error': 'Fingerprint authentication data (webauthn_response) is required or use manual:true'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
            if not is_valid:
                return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
            
            credential_id = result_or_error
            fingerprint_auth = True
        else:
            credential_id = "MANUAL_SIG"
            fingerprint_auth = False
        
        from django.utils import timezone
        from .services.convention_service import ConventionService
        
        convention.company_signed = True
        convention.company_signed_at = timezone.now()
        convention.company_fingerprint_authenticated = fingerprint_auth
        convention.company_authentication_timestamp = str(timezone.now().timestamp())
        convention.company_credential_id = credential_id
        convention.company_ip_address = get_client_ip(request)
        convention.company_user_agent = request.META.get('HTTP_USER_AGENT', '')
        if is_manual and signature_image:
            convention.company_signature_image = signature_image
            
        convention.status = 'pending_admin_validation'
        convention.save()
        
        ConventionService.regenerate_pdf(convention)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_company_signed(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': f"Convention signed successfully with {'Fingerprint' if fingerprint_auth else 'Manual Signature'}",
            'convention': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='validate_admin', permission_classes=[permissions.IsAdminUser])
    def validate_admin(self, request, pk=None):
        print(f"validate_admin called with pk={pk} by user={request.user} (is_staff={request.user.is_staff})")
        #POST /api/conventions/<id>/validate_admin/
        try:
            convention = self.get_object()
        except Exception as e:
            print(f"get_object failed: {e}")
            raise
        
        # Allow admin to sign at any stage as long as it's not already validated/rejected
        if convention.status in ['validated', 'rejected']:
            return Response(
                {
                    'error': f'Cannot validate a convention that is already {convention.status}.',
                    'current_status': convention.status
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if convention.admin_signed:
            return Response(
                {'error': 'You have already signed this convention'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check for manual signature fallback
        is_manual = request.data.get('manual', False)
        
        if not is_manual:
            webauthn_response = request.data.get('webauthn_response')
            if not webauthn_response:
                return Response(
                    {'error': 'Fingerprint authentication data (webauthn_response) is required or use manual:true'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
            if not is_valid:
                return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
            
            credential_id = result_or_error
            auth_method = "Fingerprint"
            signature_image = None
        else:
            credential_id = "MANUAL_DIGITAL_SIG"
            auth_method = "Secure Digital Signature"
            signature_image = request.data.get('signature_image', None)
        
        from django.utils import timezone
        from .services.convention_service import ConventionService
        
        convention.admin_signed = True
        convention.admin_signed_at = timezone.now()
        convention.admin_signed_by = request.user
        convention.admin_fingerprint_authenticated = (not is_manual)
        convention.admin_authentication_timestamp = str(timezone.now().timestamp())
        convention.admin_credential_id = credential_id
        convention.admin_ip_address = get_client_ip(request)
        convention.admin_user_agent = request.META.get('HTTP_USER_AGENT', '')
        if signature_image:
            convention.admin_signature_image = signature_image
            
        # If both others are already signed, this completes it
        if convention.student_signed and convention.company_signed:
            convention.status = 'validated'
            final_version = True
        else:
            final_version = False
            
        convention.save()
        
        ConventionService.regenerate_pdf(convention, final=final_version)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_validated(convention)
        
        serializer = self.get_serializer(convention)
        return Response({
            'message': f'Convention validated successfully with {auth_method}',
            'convention': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_convention(self, request, pk=None):
        #POST /api/conventions/<id>/reject/
        convention = self.get_object()
        
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only the admin can reject'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        reason = request.data.get('reason', 'No reason provided')
        
        from .services.convention_service import ConventionService
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
        #GET /api/conventions/<id>/status/
        convention = self.get_object()
        return Response({
            "id": convention.id,
            "status": convention.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        #GET /api/conventions/<id>/history/
        convention = self.get_object()
        return Response({
            "id": convention.id,
            "status": convention.status,
            "history": convention.get_signature_status()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='notify-reminder')
    def notify_reminder(self, request, pk=None):
        #POST /api/conventions/<id>/notify-reminder/
        convention = self.get_object()
        
        # Only admin can send reminders
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can send reminders'}, status=status.HTTP_403_FORBIDDEN)
            
        target = request.data.get('target') # 'student' or 'company'
        if target not in ['student', 'company']:
            return Response({'error': 'Invalid target. Must be student or company'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if they actually need to sign
        if target == 'student' and convention.student_signed:
            return Response({'error': 'Student has already signed'}, status=status.HTTP_400_BAD_REQUEST)
        if target == 'company' and convention.company_signed:
            return Response({'error': 'Company has already signed'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.notifications.services import NotificationService
        NotificationService.remind_signature(convention, target)
        
        return Response({'message': f'Reminder sent to {target}'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        #GET /api/conventions/pending/
        qs = Convention.objects.filter(status='pending_admin_validation')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        #GET /api/conventions/stats/
        from django.db.models import Count
        stats = Convention.objects.values('status').annotate(count=Count('status'))
        
        # Format the result nicely
        result = {item['status']: item['count'] for item in stats}
        result['total'] = Convention.objects.count()
        
        return Response(result, status=status.HTTP_200_OK)
