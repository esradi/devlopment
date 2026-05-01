from rest_framework import serializers
from apps.accounts.models import Student, StudentSkill
from apps.specialities.models import Skill, Domain


class SkillDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = SkillDetailSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=Skill.objects.all(),
        source='skill',
        required=False
    )

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill', 'skill_id', 'is_verified']
        read_only_fields = ['is_verified']


class StudentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id',
            'user_id',
            'user_email',
            'first_name',
            'last_name',
            'email',
            'domain',
            'speciality',
            'university',
            'academic_year',
            'cv',
            'profile_picture',
            'profile_completeness',
            'wilaya',
            'github_url',
            'linkedin_url',
            'portfolio_url',
            'skills'
        ]
        read_only_fields = ['id', 'user_id', 'user_email', 'profile_completeness']

    def get_skills(self, obj):
        skills = obj.studentskill_set.all()
        return StudentSkillSerializer(skills, many=True).data