from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.accounts.models import Student, StudentSkill
from apps.api.permissions import IsStudent
from .serializers import StudentProfileSerializer, StudentSkillSerializer


class StudentProfileView(APIView):
    """
    GET: Retrieve student's full profile (domain, speciality, competencies)
    PUT: Update student profile fields (domain, speciality, cv, etc.)
    """
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        """Get the authenticated student's full profile"""
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        """Update the authenticated student's profile fields"""
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentProfileSerializer(student, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Profile updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCompetenciesView(APIView):
    """
    GET: Retrieve all student's competencies (skills)
    POST: Add a new skill to student's competencies
    """
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        """Get all competencies for the authenticated student"""
        try:
            student = Student.objects.get(user=request.user)
            competencies = StudentSkill.objects.filter(student=student)
            serializer = StudentSkillSerializer(competencies, many=True)
            return Response(
                {"competencies": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """Add a new skill to the authenticated student's competencies"""
        try:
            student = Student.objects.get(user=request.user)
            
            # Get skill_id from request
            skill_id = request.data.get('skill_id')
            if not skill_id:
                return Response(
                    {"error": "skill_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if student already has this skill
            if StudentSkill.objects.filter(student=student, skill_id=skill_id).exists():
                return Response(
                    {"error": "Student already has this skill"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use serializer to validate and create
            serializer = StudentSkillSerializer(data={'skill_id': skill_id})
            if serializer.is_valid():
                # Manually set student before saving
                student_skill = serializer.save(student=student)
                return Response(
                    {
                        "message": "Skill added successfully",
                        "data": StudentSkillSerializer(student_skill).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCompetencyDetailView(APIView):
    """
    GET: Retrieve a specific student competency (skill)
    DELETE: Remove a skill from student's competencies
    """
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request, competency_id):
        """Get details of a specific competency for the authenticated student"""
        try:
            student = Student.objects.get(user=request.user)
            competency = StudentSkill.objects.get(id=competency_id, student=student)
            serializer = StudentSkillSerializer(competency)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except StudentSkill.DoesNotExist:
            return Response(
                {"error": "Competency not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, competency_id):
        """Delete a skill from the authenticated student's competencies"""
        try:
            student = Student.objects.get(user=request.user)
            competency = StudentSkill.objects.get(id=competency_id, student=student)
            skill_name = competency.skill.name
            competency.delete()
            return Response(
                {"message": f"Competency '{skill_name}' removed successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except StudentSkill.DoesNotExist:
            return Response(
                {"error": "Competency not found"},
                status=status.HTTP_404_NOT_FOUND
            )
