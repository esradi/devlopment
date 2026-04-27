from rest_framework import serializers
from apps.accounts.models import Company
from apps.offers.models import Application
from apps.matching.models import MatchScore
from .models import CompanyDocument, Interview
from django.utils import timezone

class CompanyLogoSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(max_length=None, use_url=True, required=True)
    
    class Meta:
        model = Company
        fields = ['logo']

    def validate_logo(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Logo file size must be under 5MB.")
        return value

class CompanyProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id', 'user_id', 'user_email', 'company_name', 'company_type', 
            'country', 'city', 'address', 'postal_code', 'website', 
            'nif', 'registre_commerce', 'industry', 'company_size', 
            'description', 'logo', 'referral_source', 'verification_status'
        ]
        read_only_fields = ['id', 'user_id', 'user_email', 'verification_status']

class CompanyUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'company_name', 'company_type', 'country', 'city', 
            'address', 'postal_code', 'website', 'nif', 
            'registre_commerce', 'industry', 'company_size', 
            'description', 'referral_source'
        ]

class CompanyVerificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'verification_status',
            'verified_at',
            'verified_by',
            'rejection_reason'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        is_verified = instance.verification_status == 'verified'
        data['can_post_offers'] = is_verified
        data['can_view_applications'] = is_verified
        
        latest_doc = CompanyDocument.objects.filter(company=instance).order_by('-uploaded_at').first()
        data['submitted_at'] = latest_doc.uploaded_at if latest_doc else None
        return data

class CompanyApplicationListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_photo = serializers.ImageField(source='student.profile_picture', read_only=True)
    student_cv = serializers.FileField(source='student.cv', read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'student_name', 'student_photo', 'student_cv', 
            'offer', 'offer_title', 'status', 'created_at', 'match_score', 'company_notes'
        ]

    def get_match_score(self, obj):
        match = MatchScore.objects.filter(student=obj.student, offer=obj.offer).first()
        return match.total_score if match else 0

class CompanyApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status']
        
class CompanyApplicationNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['company_notes']

class InterviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='application.student.user.get_full_name', read_only=True)
    offer_title = serializers.CharField(source='application.offer.title', read_only=True)
    
    class Meta:
        model = Interview
        fields = '__all__'

class InterviewScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ['application', 'proposed_spot_1', 'proposed_spot_2', 'proposed_spot_3', 'duration_minutes', 'interview_type', 'meeting_link', 'location']

    def validate(self, data):
        now = timezone.now()
        for spot in ['proposed_spot_1', 'proposed_spot_2', 'proposed_spot_3']:
            if data.get(spot) and data[spot] < now:
                raise serializers.ValidationError({spot: "Proposed spot must be in the future."})
        if not any([data.get('proposed_spot_1'), data.get('proposed_spot_2'), data.get('proposed_spot_3')]):
             raise serializers.ValidationError("At least one proposed spot must be provided.")
        return data

class InterviewFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ['status', 'feedback', 'score']

from apps.conventions.models import Convention

class CompanyConventionListSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True)
    signature_status = serializers.SerializerMethodField()

    class Meta:
        model = Convention
        fields = [
            'id', 'student_name', 'offer_title', 'internship_title',
            'start_date', 'end_date', 'status', 'signature_status',
            'pdf_file', 'created_at'
        ]

    def get_signature_status(self, obj):
        return obj.get_signature_status()

class CompanyConventionSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Convention
        fields = [
            'company_fingerprint_authenticated',
            'company_authentication_timestamp',
            'company_credential_id',
            'company_ip_address',
            'company_user_agent'
        ]
        extra_kwargs = {
            'company_fingerprint_authenticated': {'required': False},
            'company_authentication_timestamp': {'required': False},
            'company_credential_id': {'required': False},
            'company_ip_address': {'required': False},
            'company_user_agent': {'required': False},
            'company_user_agent': {'required': False},
        }

from .models import CompanyTeamMember

class CompanyTeamMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = CompanyTeamMember
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'can_create_offers', 'can_edit_offers', 'can_delete_offers',
            'can_view_applications', 'can_accept_applications',
            'can_refuse_applications', 'can_sign_conventions',
            'can_invite_team_members', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
