from rest_framework import serializers
from .models import Domain, Speciality, Competency, CompetencyQuiz, QuizQuestion, QuizSubmission, PortfolioSubmission

class CompetencySerializer(serializers.ModelSerializer):
    speciality_name = serializers.ReadOnlyField(source='speciality.name')

    class Meta:
        model = Competency
        fields = ['id', 'name', 'speciality', 'speciality_name', 'description', 'level_required']
        read_only_fields = ['speciality_name']


class SpecialitySerializer(serializers.ModelSerializer):
    domain_name = serializers.ReadOnlyField(source='domain.name')
    competencies_count = serializers.SerializerMethodField()

    class Meta:
        model = Speciality
        fields = ['id', 'name', 'domain', 'domain_name', 'description', 'competencies_count']

    def get_competencies_count(self, obj):
        return obj.competencies.count()


class DomainSerializer(serializers.ModelSerializer):
    specialities_count = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = ['id', 'name', 'specialities_count']

    def get_specialities_count(self, obj):
        return obj.specialities.count()


class SpecialityDetailSerializer(SpecialitySerializer):
    competencies = CompetencySerializer(many=True, read_only=True)

    class Meta(SpecialitySerializer.Meta):
        fields = SpecialitySerializer.Meta.fields + ['competencies']


class DomainDetailSerializer(DomainSerializer):
    specialities = SpecialitySerializer(many=True, read_only=True)

    class Meta(DomainSerializer.Meta):
        fields = DomainSerializer.Meta.fields + ['specialities']


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class CompetencyQuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = CompetencyQuiz
        fields = ['id', 'competency', 'title', 'instructions', 'time_limit_minutes', 'difficulty', 'questions']


class QuizSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSubmission
        fields = ['id', 'student', 'quiz', 'answers', 'score', 'passed', 'submitted_at']
        read_only_fields = ['score', 'passed', 'submitted_at']


class PortfolioSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSubmission
        fields = ['id', 'student', 'competency', 'portfolio_url', 'status', 'feedback', 'submitted_at', 'reviewed_at']
        read_only_fields = ['student', 'competency', 'status', 'feedback', 'submitted_at', 'reviewed_at']
