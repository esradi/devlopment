from rest_framework import serializers
from .models import (
    Offer, Location, OfferType, DurationOption,
    FavoriteOffer, Application, OfferEvent
)
from apps.specialities.models import Domain, Skill
from apps.specialities.serializers import DomainSerializer, SkillSerializer

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class OfferTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferType
        fields = ['id', 'name']

class DurationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DurationOption
        fields = ['id', 'months']

class OfferSerializer(serializers.ModelSerializer):
    company_name = serializers.ReadOnlyField(source='company.company_name')
    company_logo = serializers.ImageField(source='company.logo', read_only=True)
    is_favorite = serializers.SerializerMethodField()

    domains = DomainSerializer(many=True, read_only=True)
    locations = LocationSerializer(many=True, read_only=True)
    offer_types = OfferTypeSerializer(many=True, read_only=True)
    durations = DurationOptionSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
 
    domain_ids = serializers.PrimaryKeyRelatedField(
        queryset=Domain.objects.all(), many=True, write_only=True, source='domains'
    )
    location_ids = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), many=True, write_only=True, source='locations'
    )
    offer_type_ids = serializers.PrimaryKeyRelatedField(
        queryset=OfferType.objects.all(), many=True, write_only=True, source='offer_types'
    )
    duration_ids = serializers.PrimaryKeyRelatedField(
        queryset=DurationOption.objects.all(), many=True, write_only=True, source='durations'
    )
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), many=True, write_only=True, source='skills'
    )

    match_score = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'company', 'company_name', 'company_logo', 'title', 
            'description', 'domains', 'domain_ids', 'locations', 'location_ids',
            'offer_types', 'offer_type_ids', 'durations', 'duration_ids',
            'skills', 'skill_ids',
            'status', 'requirements', 'salary', 'is_favorite', 'match_score', 
            'is_featured', 'boosted_until',
            'wilaya', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'created_at', 'updated_at']

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'student':
            return FavoriteOffer.objects.filter(user=user, offer=obj).exists()
        return False

    def get_match_score(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'student':
            from apps.matching.services import MatchingService
            try:
                student = getattr(user, 'student_profile', None)
                if student:
                    match_data = MatchingService.calculate_match_score(student.id, obj.id)
                    return match_data.get('total_score', 0)
            except Exception:
                pass
        return 0

class FavoriteOfferSerializer(serializers.ModelSerializer):
    offer_details = OfferSerializer(source='offer', read_only=True)
    
    class Meta:
        model = FavoriteOffer
        fields = ['id', 'offer', 'offer_details', 'created_at']

class OfferStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['status']

class ApplicationSerializer(serializers.ModelSerializer):
    match_score = serializers.SerializerMethodField()
    student_name = serializers.ReadOnlyField(source='student.user.get_full_name')
    offer_title = serializers.ReadOnlyField(source='offer.title')
    company_name = serializers.ReadOnlyField(source='offer.company.company_name')
    company_logo = serializers.ImageField(source='offer.company.logo', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'student_name', 'offer', 'offer_title',
            'company', 'company_name', 'company_logo',
            'status', 'cover_letter', 'company_notes',
            'match_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'status', 'company_notes', 'created_at', 'updated_at']

    def get_match_score(self, obj):
        from apps.matching.services import MatchingService
        try:
            return MatchingService.calculate_match_score(obj.student.id, obj.offer.id).get('total_score', 0)
        except Exception:
            return 0

    def validate(self, data):
        offer = data.get('offer')
        if offer:
            data['company'] = offer.company
        return data


class ApplicationNotesSerializer(serializers.ModelSerializer):
    """Serializer for company to update internal notes on an application."""
    class Meta:
        model = Application
        fields = ['company_notes']

class OfferEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferEvent
        fields = ['id', 'event_type', 'description', 'metadata', 'timestamp']
