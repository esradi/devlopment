from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer, VerifyEmailSerializer,
    ChangePasswordSerializer, UserUpdateSerializer, StudentUpdateSerializer,
    CompanyUpdateSerializer, AdminProfileUpdateSerializer
)
from .models import User, Student, Company, AdminProfile
from .utils import generate_verification_code, send_verification_email, send_password_reset_email

def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data) # DRF combines data and FILES if multipart
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
            user.verification_code = None # Clear code after verification
            user.save()
            return Response({'message': 'Email verified successfully'})
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
            # Use same 6-digit code logic for simpler reset in this implementation
            user.verification_code = generate_verification_code()
            user.save()
            
            if send_password_reset_email(user.email, user.verification_code):
                return Response({'message': 'Password reset code sent to your email'})
            else:
                return Response({'error': 'Backend failed to send email. Check SMTP settings.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except User.DoesNotExist:
            # Don't reveal if user exists for security, or keep it simple for now
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
    """
    Simulated logout. Frontend should delete tokens.
    Blacklisting disabled due to MariaDB 10.4 compatibility.
    """
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_placeholder(request):
    return Response({'message': 'Google Social Auth endpoint ready for integration'}, status=status.HTTP_200_OK)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    user_serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    
    if not user_serializer.is_valid():
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user_serializer.save()
    
    # Update role-specific profile
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