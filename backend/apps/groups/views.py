from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from .models import StudyGroup, StudyGroupMember, GroupMessage, GroupResource
from .serializers import (
    StudyGroupSerializer, 
    StudyGroupMemberSerializer, 
    GroupMessageSerializer, 
    GroupResourceSerializer
)


class IsStudent(permissions.BasePermission):
    """Allow only students to access"""
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'student_profile')
        )


class StudyGroupListCreateView(APIView):
    """List groups and suggested groups, create new group"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        from apps.accounts.models import Student
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'my_groups': [], 'suggested_groups': []})
        
        # My groups
        my_groups = StudyGroup.objects.filter(
            members__student=student
        ).distinct()
        
        # Suggested groups (same speciality, not member yet)
        suggested_groups = StudyGroup.objects.filter(
            speciality=student.speciality
        ).exclude(
            members__student=student
        ).annotate(
            member_count=Count('members')
        ).filter(
            member_count__lt=8
        ).distinct()[:10]
        
        my_serializer = StudyGroupSerializer(
            my_groups, 
            many=True, 
            context={'request': request}
        )
        suggested_serializer = StudyGroupSerializer(
            suggested_groups,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'my_groups': my_serializer.data,
            'suggested_groups': suggested_serializer.data
        })

    def post(self, request):
        student = request.user.student_profile
        data = request.data.copy()
        data['creator'] = request.user.id
        
        serializer = StudyGroupSerializer(
            data=data,
            context={'request': request}
        )
        if serializer.is_valid():
            group = serializer.save(creator=request.user)
            # Auto-add creator as member
            StudyGroupMember.objects.create(group=group, student=student)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudyGroupDetailView(APIView):
    """Get group details"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        serializer = StudyGroupSerializer(
            group,
            context={'request': request}
        )
        return Response(serializer.data)


class StudyGroupJoinView(APIView):
    """Join a study group (max 8 members)"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        student = request.user.student_profile
        
        # Check if already member
        if StudyGroupMember.objects.filter(group=group, student=student).exists():
            return Response(
                {'detail': 'Already a member of this group'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check member limit
        member_count = group.members.count()
        if member_count >= 8:
            return Response(
                {'detail': 'Group is full (max 8 members)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership = StudyGroupMember.objects.create(group=group, student=student)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_group_joined(membership)
        
        return Response(
            {'detail': 'Joined group successfully'},
            status=status.HTTP_201_CREATED
        )


class StudyGroupLeaveView(APIView):
    """Leave a study group"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def post(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        student = request.user.student_profile
        
        membership = get_object_or_404(
            StudyGroupMember,
            group=group,
            student=student
        )
        
        # Creator can't leave (must delete group instead)
        if group.creator == request.user:
            return Response(
                {'detail': 'Creator cannot leave. Delete the group instead.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        membership.delete()
        return Response({'detail': 'Left group successfully'})


class GroupDeleteView(APIView):
    """Delete a study group (creator only)"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def delete(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        
        if group.creator != request.user:
            return Response(
                {'detail': 'Only creator can delete the group'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        group.delete()
        return Response({'detail': 'Group deleted successfully'})


class GroupMessageListCreateView(APIView):
    """Get group chat history and send messages"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        
        # Verify user is a member
        student = request.user.student_profile
        if not group.members.filter(student=student).exists():
            return Response(
                {'detail': 'Not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        messages = group.messages.all().order_by('-timestamp')
        paginator = PageNumberPagination()
        paginator.page_size = 50
        result = paginator.paginate_queryset(messages, request)
        
        serializer = GroupMessageSerializer(
            result,
            many=True,
            context={'request': request}
        )
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        student = request.user.student_profile
        
        # Verify user is a member
        if not group.members.filter(student=student).exists():
            return Response(
                {'detail': 'Not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['group'] = group.id
        data['sender'] = request.user.id
        
        serializer = GroupMessageSerializer(
            data=data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save(group=group, sender=request.user)
            # Broadcast via WebSocket will happen in real-time if client is connected
            # For REST API, messages are saved to DB and can be fetched via GET
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupResourceListCreateView(APIView):
    """Get group resources and share new resources"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        
        # Verify user is a member
        student = request.user.student_profile
        if not group.members.filter(student=student).exists():
            return Response(
                {'detail': 'Not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        resources = group.resources.all().order_by('-uploaded_at')
        serializer = GroupResourceSerializer(
            resources,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request, group_id):
        group = get_object_or_404(StudyGroup, id=group_id)
        student = request.user.student_profile
        
        # Verify user is a member
        if not group.members.filter(student=student).exists():
            return Response(
                {'detail': 'Not a member of this group'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['group'] = group.id
        data['uploaded_by'] = request.user.id
        
        serializer = GroupResourceSerializer(
            data=data,
            context={'request': request}
        )
        if serializer.is_valid():
            resource = serializer.save(group=group, uploaded_by=request.user)
            
            from apps.notifications.services import NotificationService
            NotificationService.notify_group_resource_shared(resource)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
