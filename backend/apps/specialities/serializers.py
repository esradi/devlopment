from rest_framework import serializers
from .models import Domain, Speciality, Skill, SkillQuiz, SkillQuizQuestion, SkillQuizSubmission, PortfolioSubmission

class SkillSerializer(serializers.ModelSerializer):
    speciality_name = serializers.ReadOnlyField(source='speciality.name')

    class Meta:
        model = Skill
        fields = ['id', 'name', 'speciality', 'speciality_name', 'description', 'level_required']
        read_only_fields = ['speciality_name']


class SpecialitySerializer(serializers.ModelSerializer):
    domain_name = serializers.ReadOnlyField(source='domain.name')
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = Speciality
        fields = ['id', 'name', 'domain', 'domain_name', 'description', 'skills_count']

    def get_skills_count(self, obj):
        return obj.skills.count()


class DomainSerializer(serializers.ModelSerializer):
    specialities_count = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = ['id', 'name', 'specialities_count']

    def get_specialities_count(self, obj):
        return obj.specialities.count()


class SpecialityDetailSerializer(SpecialitySerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta(SpecialitySerializer.Meta):
        fields = SpecialitySerializer.Meta.fields + ['skills']


class DomainDetailSerializer(DomainSerializer):
    specialities = SpecialitySerializer(many=True, read_only=True)

    class Meta(DomainSerializer.Meta):
        fields = DomainSerializer.Meta.fields + ['specialities']


class SkillQuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillQuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class SkillQuizSerializer(serializers.ModelSerializer):
    questions = SkillQuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = SkillQuiz
        fields = ['id', 'skill', 'title', 'instructions', 'time_limit_minutes', 'difficulty', 'questions']


class SkillQuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillQuizSubmission
        fields = ['id', 'student', 'quiz', 'answers', 'score', 'passed', 'submitted_at']
        read_only_fields = ['score', 'passed', 'submitted_at']


class PortfolioSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSubmission
        fields = ['id', 'student', 'skill', 'portfolio_url', 'status', 'feedback', 'submitted_at', 'reviewed_at']
        read_only_fields = ['student', 'skill', 'status', 'feedback', 'submitted_at', 'reviewed_at']
