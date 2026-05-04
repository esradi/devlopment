from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.admin_panel.models import InternshipValidation, AdminActionLog
from apps.conventions.models import Convention
from apps.offers.models import Application, Offer
from apps.accounts.models import Student, Company
from apps.specialities.models import PortfolioSubmission, Domain
from apps.specialities.serializers import SpecialityDetailSerializer

User = get_user_model()

# --- 1. SHARED MINIMAL SERIALIZERS ---
class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']

class StudentMinimalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Student
        fields = ['id', 'email', 'first_name', 'last_name', 'domain', 'speciality']

class CompanyMinimalSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    class Meta:
        model = Company
        fields = ['id', 'email', 'company_name', 'industry', 'verification_status']

# --- 2. CORE ADMIN SERIALIZERS ---

class InternshipValidationSerializer(serializers.ModelSerializer):
    """Handles List, Detail, and Status Updates for Internships"""
    student_name = serializers.CharField(source='application.student.user.get_full_name', read_only=True)
    student_university = serializers.CharField(source='application.student.university', read_only=True)
    offer_title = serializers.CharField(source='application.offer.title', read_only=True)
    company_name = serializers.CharField(source='application.offer.company.company_name', read_only=True)
    validated_by_name = serializers.CharField(source='validated_by.get_full_name', read_only=True)

    class Meta:
        model = InternshipValidation
        fields = [
            'id', 'student_name', 'student_university', 'offer_title',
            'company_name', 'status', 'feedback', 'validated_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'validated_by_name']

class AdminUserSerializer(serializers.ModelSerializer):
    """Handles User listing and status/ID verification toggles"""
    domain = serializers.CharField(source='student_profile.domain', read_only=True, default=None)
    speciality = serializers.CharField(source='student_profile.speciality', read_only=True, default=None)
    university = serializers.CharField(source='student_profile.university', read_only=True, default=None)
    cv = serializers.FileField(source='student_profile.cv', read_only=True, default=None)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'is_active', 'id_verified', 'is_suspended', 
            'suspension_reason', 'domain', 'speciality', 'university', 'date_joined',
            'national_id_card', 'cv', 'role'
        ]
        read_only_fields = ['id', 'email', 'date_joined']

class AdminCompanySerializer(serializers.ModelSerializer):
    """Handles Company listing and verification status"""
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'email', 'company_name', 'industry', 'verification_status']
        read_only_fields = ['id', 'email']

class AdminDashboardSerializer(serializers.Serializer):
    users = serializers.DictField()
    offers = serializers.DictField()
    applications = serializers.DictField()
    validations = serializers.DictField()
    conventions = serializers.DictField()
    pending_validations_url = serializers.CharField()
    pending_conventions_url = serializers.CharField()

class AdminActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminActionLog
        fields = ['id', 'action_type', 'target_model', 'target_id', 'ip_address', 'metadata', 'timestamp']

class AdminPortfolioReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = PortfolioSubmission
        fields = ['id', 'student_name', 'skill_name', 'portfolio_url', 'status', 'feedback', 'submitted_at']
        read_only_fields = ['id', 'student_name', 'skill_name', 'portfolio_url', 'submitted_at']

class AdminApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.user.email', read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    convention_id = serializers.IntegerField(source='convention.id', read_only=True, allow_null=True)
    convention_status = serializers.ReadOnlyField(source='convention.status', allow_null=True)
    convention_student_signed = serializers.BooleanField(source='convention.student_signed', read_only=True, default=False)
    convention_company_signed = serializers.BooleanField(source='convention.company_signed', read_only=True, default=False)
    convention_admin_signed = serializers.BooleanField(source='convention.admin_signed', read_only=True, default=False)
    convention_admin_signature_image = serializers.CharField(source='convention.admin_signature_image', read_only=True, allow_null=True)
    convention_verification_code = serializers.CharField(source='convention.verification_code', read_only=True, allow_null=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'student_name', 'student_email', 'offer_title', 
            'company_name', 'company_id', 'status', 'convention_status', 'convention_id',
            'convention_student_signed', 'convention_company_signed', 'convention_admin_signed',
            'convention_admin_signature_image',
            'convention_verification_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields

class AdminDomainTreeSerializer(serializers.ModelSerializer):
    specialities = SpecialityDetailSerializer(many=True, read_only=True)
    class Meta:
        model = Domain
        fields = ['id', 'name', 'specialities']

from apps.challenges.models import SkillChallengeSubmission

class AdminChallengeSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_email = serializers.EmailField(source='student.user.email', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    skill_name = serializers.CharField(source='challenge.skill_name', read_only=True)
    challenge_type = serializers.CharField(source='challenge.challenge_type', read_only=True)
    
    class Meta:
        model = SkillChallengeSubmission
        fields = ['id', 'student_name', 'student_email', 'challenge_title', 'skill_name', 'challenge_type', 'score', 'passed', 'submitted_at']

