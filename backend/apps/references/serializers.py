from rest_framework import serializers
from .models import ReferenceLetter
from apps.accounts.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentReferenceSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'email', 'domain', 'speciality']
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class GeneratedBySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class ReferenceLetterCreateSerializer(serializers.ModelSerializer):

    verification_token = serializers.UUIDField(read_only=True)
    class Meta:
        model = ReferenceLetter
        fields = ['student', 'subject', 'content', 'verification_token']

    def validate_student(self, value):
        if not hasattr(value, 'user'):
            raise serializers.ValidationError("Invalid student.")
        return value


class ReferenceLetterDetailSerializer(serializers.ModelSerializer):
    student = StudentReferenceSerializer(read_only=True)
    generated_by = GeneratedBySerializer(read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = ReferenceLetter
        fields = [
            'id',
            'student',
            'generated_by',
            'subject',
            'content',
            'pdf_url',
            'issue_date',
        ]
        read_only_fields = fields

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None


class ReferenceLetterSignSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/references/:id/sign/
    Company digitally signs the letter.
    The view stamps a signature and regenerates the PDF.
    No body fields needed from the client — signing logic is in the view.
    """
    class Meta:
        model = ReferenceLetter
        fields = [] 

class ReferenceLetterVerifySerializer(serializers.ModelSerializer):

    student_name = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = ReferenceLetter
        fields = [
            'id',
            'student_name',
            'subject',
            'issue_date',
            'pdf_url',
        ]
        read_only_fields = fields

    def get_student_name(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}".strip()

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None