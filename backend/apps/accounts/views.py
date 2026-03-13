from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, VerifyEmailSerializer,
    ChangePasswordSerializer, UserUpdateSerializer, StudentUpdateSerializer,
    CompanyUpdateSerializer, AdminProfileUpdateSerializer,
    StudentBrowseSerializer, MeSerializer
)
from .models import User, Student, Company, AdminProfile
from apps.api.utils import generate_verification_code, send_verification_email, send_password_reset_email
from apps.api.permissions import IsStudent, IsCompany, IsUniversityAdmin, IsOwnerOrAdmin
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens(user)
        return Response({
            'message': 'Registration successful. Please verify your email.',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens(user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': tokens
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    """
    Returns the current user's profile and role-specific data.
    """
    serializer = MeSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    serializer = VerifyEmailSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        try:
            user = User.objects.get(email=email, verification_code=code)
            user.email_verified = True
            user.verification_code = None
            user.save()
            tokens = get_tokens(user)
            return Response({
                'message': 'Email verified successfully',
                'user': UserSerializer(user).data,
                'tokens': tokens
            })
        except User.DoesNotExist:
            return Response({'error': 'Invalid code or email'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_code(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        if user.email_verified:
            return Response({'message': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)
        user.verification_code = generate_verification_code()
        user.save()
        send_verification_email(user.email, user.verification_code)
        return Response({'message': 'Verification code resent'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            user.verification_code = generate_verification_code()
            user.save()
            
            if send_password_reset_email(user.email, user.verification_code):
                return Response({'message': 'Password reset code sent to your email'})
            else:
                return Response({'error': 'Backend failed to send email'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User.DoesNotExist:
            return Response({'message': 'If an account exists, a reset code was sent'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        password = serializer.validated_data['password']
        try:
            user = User.objects.get(email=email, verification_code=code)
            user.set_password(password)
            user.verification_code = None
            user.save()
            return Response({'message': 'Password updated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid code or email'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    user_serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    
    if not user_serializer.is_valid():
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_serializer.save()
    
    if user.role == 'student':
        student = getattr(user, 'student_profile', None)
        if student:
            serializer = StudentUpdateSerializer(student, data=request.data, partial=True)
            if serializer.is_valid(): serializer.save()
    elif user.role == 'company':
        company = getattr(user, 'company_profile', None)
        if company:
            serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
            if serializer.is_valid(): serializer.save()
    elif user.role == 'admin':
        admin = getattr(user, 'admin_profile', None)
        if admin:
            serializer = AdminProfileUpdateSerializer(admin, data=request.data, partial=True)
            if serializer.is_valid(): serializer.save()
            
    return Response({'message': 'Profile updated successfully', 'user': UserSerializer(user).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': ['Wrong password']}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    request.user.delete()
    return Response({'message': 'Account deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

class StudentListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['company', 'admin']:
            return Response({'error': 'Only companies and admins can browse students'}, status=status.HTTP_403_FORBIDDEN)
            
        students = Student.objects.all().order_by('-profile_completeness')
        serializer = StudentBrowseSerializer(students, many=True)
        return Response(serializer.data)

class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        if request.user.role not in ['company', 'admin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        student = get_object_or_404(Student, pk=pk)
        serializer = StudentBrowseSerializer(student)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_placeholder(request):
    return Response({'message': 'Google Social Auth endpoint ready for integration'}, status=status.HTTP_200_OK)

import json
from webauthn import (
    generate_authentication_options,
    options_to_json,
    verify_authentication_response,
    base64url_to_bytes,
)
from webauthn.helpers.structs import AuthenticationCredential
from django.utils import timezone
from .models import WebauthnAuthentication, WebauthnCredential

class WebauthnSigningOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        credentials = WebauthnCredential.objects.filter(user=user)

        # Basic relying party ID, using the host of the request
        rp_id = request.get_host().split(':')[0] 

        options = generate_authentication_options(
            rp_id=rp_id,
            allow_credentials=[
                {
                    "id": base64url_to_bytes(cred.credential_id) if isinstance(cred.credential_id, str) else cred.credential_id,
                    "type": "public-key",
                }
                for cred in credentials
            ],
        )

        auth, _ = WebauthnAuthentication.objects.get_or_create(user=user)
        options_dict = json.loads(options_to_json(options))
        auth.challenge = options_dict["challenge"]
        auth.created_at = timezone.now()
        auth.save()

        return Response(options_dict)

class WebauthnVerifySigningView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            auth = WebauthnAuthentication.objects.get(user=user)
        except WebauthnAuthentication.DoesNotExist:
            return Response({'error': 'No authentication challenge found.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            credential = AuthenticationCredential.parse_raw(json.dumps(request.data))
        except Exception:
            return Response({'error': 'Invalid WebAuthn response.'}, status=status.HTTP_400_BAD_REQUEST)

        # Raw ID is byte string when parsed, convert to strings for DB matching if needed
        # depending on py_webauthn versions. Standardize on bytes or b64 string matching.
        cred_obj = WebauthnCredential.objects.filter(
            user=user, 
            credential_id=credential.id # Use 'id' which py_webauthn represents as b64 string.
        ).first()
        
        if not cred_obj:
            return Response({'error': 'WebAuthn credential not found for this user.'}, status=status.HTTP_400_BAD_REQUEST)

        rp_id = request.get_host().split(':')[0]
        # Allow localhost origin mappings
        expected_origin = f"http://{request.get_host()}"
        if '127.0.0.1' in expected_origin or 'localhost' in expected_origin:
            expected_origin = [f"http://{request.get_host()}", "http://localhost:3000", "http://127.0.0.1:3000"]

        try:
            verification = verify_authentication_response(
                credential=credential,
                expected_challenge=base64url_to_bytes(auth.challenge),
                expected_rp_id=rp_id,
                expected_origin=expected_origin,
                credential_public_key=base64url_to_bytes(cred_obj.public_key) if isinstance(cred_obj.public_key, str) else cred_obj.public_key,
                credential_current_sign_count=cred_obj.sign_count,
            )
            
            # Since webauthn returns an object in newer versions (or pydantic validation json on older)
            if hasattr(verification, 'json'):
                verification_dict = json.loads(verification.json())
                cred_obj.sign_count = verification_dict.get("new_sign_count", cred_obj.sign_count + 1)
            elif hasattr(verification, 'new_sign_count'):
                cred_obj.sign_count = verification.new_sign_count
            else:
                 cred_obj.sign_count += 1
                 
            cred_obj.save()

            return Response(
                {
                    "webauthn_verified": True,
                    "credential_id": cred_obj.credential_id,
                }
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
