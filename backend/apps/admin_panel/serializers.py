from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import InternshipValidation
from apps.conventions.models import Convention
from apps.offers.models import Application, Offer
from apps.accounts.models import Student, Company
from apps.specialities.models import PortfolioSubmission, Domain
from apps.specialities.serializers import SpecialityDetailSerializer

User = get_user_model()

class UserMinimalSerializer(serializers.ModelSerializer):
    #Minimal user info embedded in other serializers
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class StudentMinimalSerializer(serializers.ModelSerializer):
    #Student info for admin user list and validation detail
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'is_active', 'domain', 'speciality', 'university',
        ]
        read_only_fields = fields


class CompanyMinimalSerializer(serializers.ModelSerializer):
    #Company info for admin company list
    email = serializers.EmailField(source='user.email', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'email', 'company_name', 'industry', 'verification_status', 'is_active']
        read_only_fields = fields


class OfferMinimalSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    domains = serializers.StringRelatedField(many=True, read_only=True)
    offer_types = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Offer
        fields = ['id', 'title', 'company_name', 'domains', 'offer_types', 'status']
        read_only_fields = fields


class ApplicationMinimalSerializer(serializers.ModelSerializer):
    student = StudentMinimalSerializer(read_only=True)
    offer = OfferMinimalSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'student', 'offer', 'status', 'created_at']
        read_only_fields = fields

class UsersStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    students = serializers.IntegerField()
    companies = serializers.IntegerField()

class OffersStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    active = serializers.IntegerField()

class ApplicationsStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    accepted = serializers.IntegerField()

class ValidationsStatsSerializer(serializers.Serializer):
    pending = serializers.IntegerField()

class AdminDashboardSerializer(serializers.Serializer):
    #used by GET /api/admin/dashboard/
    users = UsersStatsSerializer()
    offers = OffersStatsSerializer()
    applications = ApplicationsStatsSerializer()
    validations = ValidationsStatsSerializer()


class InternshipValidationListSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/validations/
    application = ApplicationMinimalSerializer(read_only=True)
    validated_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = InternshipValidation
        fields = [
            'id',
            'application',
            'status',
            'validated_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class InternshipValidationDetailSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/validations/:id/
    application = ApplicationMinimalSerializer(read_only=True)
    validated_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = InternshipValidation
        fields = [
            'id',
            'application',
            'status',
            'feedback',
            'validated_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class InternshipValidationApproveSerializer(serializers.ModelSerializer):
    #used by POST /api/admin/validations/:id/approve/
    class Meta:
        model = InternshipValidation
        fields = ['feedback'] 


class InternshipValidationRejectSerializer(serializers.ModelSerializer):
    #used by POST /api/admin/validations/:id/reject/
    feedback = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = InternshipValidation
        fields = ['feedback']

    def validate_feedback(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Rejection reason must be at least 10 characters."
            )
        return value


class ConventionSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/documents/
    class Meta:
        model = Convention
        fields = '__all__'
        

class AdminUserListSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/users/
    domain = serializers.CharField(
        source='student_profile.domain', read_only=True, default=None
    )
    speciality = serializers.CharField(
        source='student_profile.speciality', read_only=True, default=None
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'is_active', 'domain', 'speciality', 'date_joined',
        ]
        read_only_fields = fields


class AdminUserStatusSerializer(serializers.ModelSerializer):
    #used by PATCH /api/admin/users/:id/status/
    class Meta:
        model = User
        fields = ['is_active']


class AdminCompanyListSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/companies/
    email = serializers.EmailField(source='user.email', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'email', 'company_name', 'industry',
            'verification_status', 'is_active',
        ]
        read_only_fields = fields


class AdminCompanyVerifySerializer(serializers.ModelSerializer):
    #used by PATCH /api/admin/companies/:id/verify/
    class Meta:
        model = Company
        fields = ['verification_status']



class AdminDomainTreeSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/specialities/
    specialities = SpecialityDetailSerializer(many=True, read_only=True)
    
    class Meta:
        model = Domain
        fields = ['id', 'name', 'specialities']


class PortfolioSubmissionReviewSerializer(serializers.ModelSerializer):
    #used by POST /api/admin/portfolio/:submission_id/review/
    feedback = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = PortfolioSubmission
        fields = ['status', 'feedback']

    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status must be 'approved' or 'rejected'.")
        return value

class AdminPortfolioSubmissionListSerializer(serializers.ModelSerializer):
    #used by GET /api/admin/portfolios/
    student_name = serializers.SerializerMethodField()
    skill_name = serializers.CharField(source='skill.name', read_only=True)

    class Meta:
        model = PortfolioSubmission
        fields = ['id', 'student_name', 'skill_name', 'portfolio_url', 'status', 'submitted_at']
        read_only_fields = fields

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"