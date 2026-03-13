from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, Student, Company, AdminProfile, StudentSkill, StudentBadge
from apps.offers.models import Skill
from apps.api.utils import generate_verification_code, send_verification_email

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'role', 'first_name', 'last_name', 'created_at', 'email_verified']

class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    class Meta:
        model = StudentSkill
        fields = ['id', 'skill', 'skill_name', 'is_verified']

class StudentBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentBadge
        fields = ['badge_name', 'badge_type', 'description', 'earned_at']

class StudentProfileSerializer(serializers.ModelSerializer):
    skills = StudentSkillSerializer(source='studentskill_set', many=True, read_only=True)
    badges = StudentBadgeSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, write_only=True, source='skills', required=False
    )
    
    class Meta:
        model = Student
        fields = '__all__'

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = '__all__'

class MeSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'first_name', 'last_name', 'phone', 'email_verified', 'profile']

    def get_profile(self, obj):
        if obj.role == 'student':
            profile = getattr(obj, 'student_profile', None)
            return StudentProfileSerializer(profile).data if profile else None
        elif obj.role == 'company':
            profile = getattr(obj, 'company_profile', None)
            return CompanyProfileSerializer(profile).data if profile else None
        elif obj.role == 'admin':
            profile = getattr(obj, 'admin_profile', None)
            return AdminProfileSerializer(profile).data if profile else None
        return None

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
    domain = serializers.CharField(required=False, allow_blank=True) # Alias for interest
    cv = serializers.FileField(required=False, allow_null=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, required=False
    )
    wilaya = serializers.CharField(required=False, allow_blank=True)

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
            # Check if it matches after stripping or case change
            val_clean = value.strip()
            if val_clean in self.SPECIALITY_CHOICES:
                return val_clean
            # If still not found, we'll allow it but it might not map to a domain
            return value
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
        # Allow domain as an alias for interest (used by frontend)
        if not interest:
            interest = validated_data.pop('domain', '')
            
        cv = validated_data.pop('cv', None)
        skill_ids = validated_data.pop('skill_ids', [])
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
            'nif': validated_data.pop('nif', None) or None,
            'registre_commerce': validated_data.pop('registre_commerce', None) or None,
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
            # Mapping: speciality -> parent domain
            SPECIALITY_TO_DOMAIN = {
                'Computer Science': 'Engineering',
                'GP': 'Engineering',
                'ST': 'Engineering',
                'Polytechnique': 'Engineering',
                'Medicine': 'Scientific',
                'Pharmacy': 'Scientific',
                'Biology': 'Scientific',
                'English Literature': 'Humanities',
            }
            derived_domain = SPECIALITY_TO_DOMAIN.get(interest, interest)  # fallback to interest if not mapped

            student = Student.objects.create(
                user=user,
                speciality=interest,        # e.g. "Computer Science"
                domain=derived_domain,      # e.g. "Engineering"
                university=validated_data.pop('university', None),
                academic_year=validated_data.pop('academic_year', None),
                cv=cv,
                wilaya=validated_data.get('wilaya', '')
            )
            if skill_ids:
                student.skills.set(skill_ids)
        elif role == 'company':
            Company.objects.create(
                user=user,
                **company_fields
            )
        elif role == 'admin':
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
    fullName = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'fullName']

    def update(self, instance, validated_data):
        full_name = validated_data.pop('fullName', None)
        if full_name:
            parts = full_name.strip().split(' ', 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ''
        return super().update(instance, validated_data)

class StudentUpdateSerializer(serializers.ModelSerializer):
    from apps.offers.serializers import SkillSerializer
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, write_only=True, source='skills', required=False
    )
    
    class Meta:
        model = Student
        fields = ['domain', 'speciality', 'university', 'academic_year', 'cv', 'profile_picture', 'skills', 'skill_ids', 'wilaya']

class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'company_name', 'company_type', 'country', 'city', 
            'address', 'postal_code', 'website', 'nif', 
            'registre_commerce', 'industry', 'company_size', 
            'description', 'logo', 'referral_source'
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

class StudentBrowseSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    from apps.offers.serializers import SkillSerializer
    skills = SkillSerializer(many=True, read_only=True)
    
    badges = StudentBadgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone', 
            'university', 'domain', 'speciality', 'academic_year', 
            'profile_picture', 'profile_completeness', 'skills', 'badges'
        ]
