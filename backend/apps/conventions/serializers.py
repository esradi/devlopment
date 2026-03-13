from rest_framework import serializers
from .models import Convention
from apps.accounts.serializers import StudentProfileSerializer, CompanyProfileSerializer
from apps.offers.serializers import OfferSerializer

class ConventionSerializer(serializers.ModelSerializer):
    student_details = serializers.SerializerMethodField(read_only=True)
    company_details = serializers.SerializerMethodField(read_only=True)
    offer_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Convention
        fields = [
            'id', 'student', 'student_details', 'offer', 'offer_details', 
            'company', 'company_details', 'status', 'start_date', 'end_date', 
            'pdf_file', 'created_at', 'updated_at'
        ]
        read_only_fields = ['status', 'company', 'pdf_file', 'created_at', 'updated_at']

    def get_student_details(self, obj):
        return {
            "id": obj.student.id,
            "first_name": obj.student.first_name,
            "last_name": obj.student.last_name,
            "domain": obj.student.domain,
            "speciality": obj.student.speciality,
        }

    def get_company_details(self, obj):
        return {
            "id": obj.company.id,
            "company_name": obj.company.company_name,
        }
        
    def get_offer_details(self, obj):
        return {
            "id": obj.offer.id,
            "title": obj.offer.title,
        }

    def validate(self, data):
        """
        Ensure the offer belongs to the company, and auto-assign the company from the offer.
        """
        offer = data.get('offer')
        if offer:
            data['company'] = offer.company
        return data
