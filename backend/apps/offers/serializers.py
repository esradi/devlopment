from rest_framework import serializers
from .models import Offer, FavoriteOffer, Domain, Location, OfferType, DurationOption

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'name']

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
    
    # Nested representation for GET
    domains = DomainSerializer(many=True, read_only=True)
    locations = LocationSerializer(many=True, read_only=True)
    offer_types = OfferTypeSerializer(many=True, read_only=True)
    durations = DurationOptionSerializer(many=True, read_only=True)
    
    # Primary Key handles for POST/PATCH
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

    class Meta:
        model = Offer
        fields = [
            'id', 'company', 'company_name', 'company_logo', 'title', 
            'description', 'domains', 'domain_ids', 'locations', 'location_ids',
            'offer_types', 'offer_type_ids', 'durations', 'duration_ids',
            'status', 'requirements', 'salary', 'is_favorite', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'created_at', 'updated_at']

    def get_is_favorite(self, obj):
        user = self.context.get('request').user if self.context.get('request') else None
        if user and user.is_authenticated and user.role == 'student':
            return FavoriteOffer.objects.filter(user=user, offer=obj).exists()
        return False

class FavoriteOfferSerializer(serializers.ModelSerializer):
    offer_details = OfferSerializer(source='offer', read_only=True)
    
    class Meta:
        model = FavoriteOffer
        fields = ['id', 'offer', 'offer_details', 'created_at']

class OfferStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['status']
