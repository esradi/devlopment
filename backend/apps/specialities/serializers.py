from rest_framework import serializers
from .models import Domain, Speciality, Competency

class CompetencySerializer(serializers.ModelSerializer):
    """Serializer for Competency model"""
    speciality_name = serializers.ReadOnlyField(source='speciality.name')

    class Meta:
        model = Competency
        fields = ['id', 'name', 'speciality', 'speciality_name', 'description', 'level_required']
        read_only_fields = ['speciality_name']


class SpecialitySerializer(serializers.ModelSerializer):
    """Serializer for Speciality model"""
    domain_name = serializers.ReadOnlyField(source='domain.name')
    competencies_count = serializers.SerializerMethodField()

    class Meta:
        model = Speciality
        fields = ['id', 'name', 'domain', 'domain_name', 'description', 'competencies_count']

    def get_competencies_count(self, obj):
        return obj.competencies.count()


class DomainSerializer(serializers.ModelSerializer):
    """Serializer for Domain model"""
    specialities_count = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = ['id', 'name', 'specialities_count']

    def get_specialities_count(self, obj):
        return obj.specialities.count()


class SpecialityDetailSerializer(SpecialitySerializer):
    """Detailed serializer for Speciality with nested competencies"""
    competencies = CompetencySerializer(many=True, read_only=True)

    class Meta(SpecialitySerializer.Meta):
        fields = SpecialitySerializer.Meta.fields + ['competencies']


class DomainDetailSerializer(DomainSerializer):
    """Detailed serializer for Domain with nested specialities"""
    specialities = SpecialitySerializer(many=True, read_only=True)

    class Meta(DomainSerializer.Meta):
        fields = DomainSerializer.Meta.fields + ['specialities']