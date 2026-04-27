from rest_framework import serializers
from apps.accounts.models import Company

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

class CompanyLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['logo']
