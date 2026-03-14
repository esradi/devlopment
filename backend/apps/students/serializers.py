from rest_framework import serializers
from apps.accounts.models import Student, StudentSkill
from apps.offers.models import Skill, Domain


class SkillDetailSerializer(serializers.ModelSerializer):
    """Serializer for skills with domain info"""
    class Meta:
        model = Skill
        fields = ['id', 'name']


class StudentSkillSerializer(serializers.ModelSerializer):
    """Serializer for StudentSkill (ties skill with verification status)"""
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
    """Complete Student Profile with domain, speciality, and competencies"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    competencies = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            'id', 
            'user_id',
            'user_email',
            'first_name', 
            'last_name', 
            'domain', 
            'speciality', 
            'university',
            'academic_year',
            'gpa',
            'cv', 
            'profile_picture',
            'profile_completeness',
            'wilaya',
            'github_url',
            'linkedin_url',
            'portfolio_url',
            'competencies'
        ]
        read_only_fields = ['id', 'user_id', 'user_email', 'profile_completeness']

    def get_competencies(self, obj):
        """Get all competencies (skills) for the student"""
        skills = obj.studentskill_set.all()
        return StudentSkillSerializer(skills, many=True).data
