from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.db.models import Q, Count
import os

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


class StudentCVUploadView(APIView):
    """
    POST: Upload or replace student's CV file
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            cv_file = request.FILES.get('cv')
            if not cv_file:
                return Response(
                    {"error": "cv file is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # assign and save
            student.cv = cv_file
            student.save()
            serializer = StudentProfileSerializer(student)
            return Response(
                {"message": "CV uploaded successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCVDeleteView(APIView):
    """
    DELETE: Remove the student's CV file
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            # Check if student actually has a CV
            if not student.cv:
                return Response(
                    {"error": "No CV found to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Calling delete(save=True) removes the actual file from your /media/ storage
            # and clears the field in the database.
            student.cv.delete(save=True)
            
            return Response(
                {"message": "CV deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCVDownloadView(APIView):
    """
    GET: Download the student's CV
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            if not student.cv:
                return Response(
                    {"error": "No CV found to download"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Open the file and prepare the FileResponse to serve it as an attachment
            file = student.cv.open('rb')
            filename = os.path.basename(student.cv.name) # Extracts just the file name
            
            response = FileResponse(file, as_attachment=True, filename=filename)
            return response
            
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentPictureUploadView(APIView):
    """
    POST: Upload or replace student's profile picture
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            # Expecting 'profile_picture' in the form data
            picture_file = request.FILES.get('profile_picture')
            if not picture_file:
                return Response(
                    {"error": "profile_picture file is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # assign and save
            student.profile_picture = picture_file
            student.save()
            serializer = StudentProfileSerializer(student)
            return Response(
                {"message": "Profile picture uploaded successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentPictureDeleteView(APIView):
    """
    DELETE: Remove the student's profile picture
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            if not student.profile_picture:
                return Response(
                    {"error": "No profile picture found to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Calling delete(save=True) removes the actual file from your /media/ storage
            student.profile_picture.delete(save=True)
            
            return Response(
                {"message": "Profile picture deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class StudentApplicationStatsView(APIView):
    """
    GET: Return application statistics for the authenticated student.
    { total: X, pending: Y, accepted: Z, refused: W }
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            # Use Django's dynamic aggregation based on the status field
            from apps.offers.models import Application
            stats = Application.objects.filter(student=student).aggregate(
                total=Count('id'),
                pending=Count('id', filter=Q(status='pending')),
                accepted=Count('id', filter=Q(status='accepted')),
                refused=Count('id', filter=Q(status='rejected')) # using 'rejected' to match the database values
            )
            
            # aggregate might return None if no records, so we provide default 0
            response_data = {
                "total": stats.get('total') or 0,
                "pending": stats.get('pending') or 0,
                "accepted": stats.get('accepted') or 0,
                "refused": stats.get('refused') or 0
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
