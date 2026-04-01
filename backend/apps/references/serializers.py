from rest_framework import serializers
from .models import ReferenceLetter
from accounts.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentReferenceSerializer(serializers.ModelSerializer):
    """Minimal student info embedded in reference letter responses."""
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Student
        fields = ['id', 'full_name', 'email', 'domain', 'speciality']
        read_only_fields = fields

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class GeneratedBySerializer(serializers.ModelSerializer):
    """Who generated the letter (company user)."""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class ReferenceLetterCreateSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/references/
    Company generates a reference letter for a student.
    Only requires student + subject + content.
    pdf_file and generated_by are handled in the view.
    """
    class Meta:
        model = ReferenceLetter
        fields = ['student', 'subject', 'content']

    def validate_student(self, value):
        # Ensure the student actually exists and has a completed profile
        if not hasattr(value, 'user'):
            raise serializers.ValidationError("Invalid student.")
        return value


class ReferenceLetterDetailSerializer(serializers.ModelSerializer):
    """
    Used by GET /api/references/:id/
    Full detail — accessible by the company who generated it or the student.
    """
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
    """
    Used by GET /api/references/verify/:token/
    """
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