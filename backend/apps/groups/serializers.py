from rest_framework import serializers
from .models import StudyGroup, StudyGroupMember, GroupMessage, GroupResource

class StudyGroupMemberSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = StudyGroupMember
        fields = ['id', 'group', 'student', 'student_name', 'joined_at']
        read_only_fields = ['group', 'student', 'joined_at']

class StudyGroupSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    speciality_name = serializers.CharField(source='speciality.name', read_only=True)
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    members = StudyGroupMemberSerializer(many=True, read_only=True)

    class Meta:
        model = StudyGroup
        fields = [
            'id', 'name', 'description', 
            'domain', 'domain_name', 
            'speciality', 'speciality_name', 
            'topic', 'creator', 'creator_name', 
            'created_at', 'member_count', 'is_member', 'members'
        ]
        read_only_fields = ['creator', 'created_at']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(request.user, 'student_profile'):
                return obj.members.filter(student=request.user.student_profile).exists()
        return False

class GroupMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'group', 'sender', 'sender_name', 'content', 'timestamp']
        read_only_fields = ['group', 'sender', 'timestamp']

class GroupResourceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = GroupResource
        fields = ['id', 'group', 'uploaded_by', 'uploaded_by_name', 'title', 'file', 'uploaded_at']
        read_only_fields = ['group', 'uploaded_by', 'uploaded_at']
