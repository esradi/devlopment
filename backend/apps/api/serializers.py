from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, Student, Company, AdminProfile
from .utils import generate_verification_code, send_verification_email

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'role', 'created_at']

class RegisterSerializer(serializers.Serializer):
    # Common Fields
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('student', 'student'), ('company', 'company'), ('admin', 'admin')], required=True)
    fullName = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)

    # Student Specific
    interest = serializers.CharField(required=False, allow_blank=True) # Speciality
    cv = serializers.FileField(required=False, allow_null=True)

    # Company Specific
    company_name = serializers.CharField(required=False, allow_blank=True)
    company_type = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    nif = serializers.CharField(required=False, allow_blank=True)
    registre_commerce = serializers.CharField(required=False, allow_blank=True)
    industry = serializers.CharField(required=False, allow_blank=True)
    company_size = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    referral_source = serializers.CharField(required=False, allow_blank=True)
    logo = serializers.ImageField(required=False, allow_null=True)

    # Admin Specific
    admin_role = serializers.CharField(required=False, allow_blank=True)

    SPECIALITY_CHOICES = [
        'Computer Science', 'Medicine', 'Pharmacy', 'Biology', 
        'Polytechnique', 'GP', 'ST', 'English Literature'
    ]
    
    def validate_interest(self, value):
        role = self.initial_data.get('role')
        if role == 'student' and value and value not in self.SPECIALITY_CHOICES:
            raise serializers.ValidationError(f"Please select a valid speciality from the list.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Passwords don't match"})
            
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
            
        return attrs
        
    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop('role')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        conf_password = validated_data.pop('confirmPassword')
        full_name = validated_data.pop('fullName')
        phone = validated_data.pop('phone')

        # Pop role-specific fields
        interest = validated_data.pop('interest', '')
        cv = validated_data.pop('cv', None)
        admin_role_input = validated_data.pop('admin_role', '')

        # Company fields pop
        company_fields = {
            'company_name': validated_data.pop('company_name', ''),
            'company_type': validated_data.pop('company_type', ''),
            'country': validated_data.pop('country', ''),
            'city': validated_data.pop('city', ''),
            'address': validated_data.pop('address', ''),
            'postal_code': validated_data.pop('postal_code', ''),
            'website': validated_data.pop('website', None),
            'nif': validated_data.pop('nif', ''),
            'registre_commerce': validated_data.pop('registre_commerce', ''),
            'industry': validated_data.pop('industry', ''),
            'company_size': validated_data.pop('company_size', ''),
            'description': validated_data.pop('description', ''),
            'referral_source': validated_data.pop('referral_source', ''),
            'logo': validated_data.pop('logo', None),
        }

        # Determine first_name and last_name
        name_parts = full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            email=email,
            username=email,
            password=password,
            phone=phone,
            role=role,
            first_name=first_name,
            last_name=last_name,
            verification_code=generate_verification_code()
        )
        
        if not send_verification_email(user.email, user.verification_code):
            user.delete()
            raise serializers.ValidationError({"email": "Failed to send verification email. Please check server SMTP settings or use a valid App Password."})
        
        if role == 'student':
            from .models import Student
            Student.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                domain=interest,
                cv=cv
            )
        elif role == 'company':
            from .models import Company
            Company.objects.create(
                user=user,
                **company_fields
            )
        elif role == 'admin':
            from .models import AdminProfile
            AdminProfile.objects.create(
                user=user,
                admin_role=admin_role_input
            )
            
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match"})
        return attrs

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone']

class StudentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['domain', 'cv']

class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'company_name', 'company_type', 'country', 'city', 
            'address', 'postal_code', 'website', 'nif', 
            'registre_commerce', 'industry', 'company_size', 
            'description', 'logo'
        ]

class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['admin_role']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        email = attrs.get('email')
        password = attrs.get('password')
        
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials')
            
        attrs['user'] = user
        return attrs

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirmPassword = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"confirmPassword": "Passwords don't match"})
        return attrs

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
