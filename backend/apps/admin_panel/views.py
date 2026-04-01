from rest_framework.views import APIView
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import InternshipValidation
from apps.accounts.models import Student, Company
from apps.offers.models import Offer, Application
from apps.conventions.models import Convention
from apps.conventions.services.convention_service import ConventionService
from .serializers import (
    InternshipValidationListSerializer,
    InternshipValidationDetailSerializer,
    InternshipValidationApproveSerializer,
    InternshipValidationRejectSerializer,
    ConventionSerializer,
    AdminUserListSerializer,
    AdminUserListSerializer,
    AdminUserStatusSerializer,
    AdminCompanyListSerializer,
    AdminCompanyVerifySerializer,
    AdminDomainTreeSerializer,
    PortfolioSubmissionReviewSerializer
)
from apps.specialities.models import Domain, PortfolioSubmission

User = get_user_model()

class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/dashboard/
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        total_students = Student.objects.count()
        total_companies = Company.objects.count()
        
        # Offers stats
        total_offers = Offer.objects.count()
        active_offers = Offer.objects.filter(status='active').count()
        
        # Applications stats
        total_applications = Application.objects.count()
        accepted_applications = Application.objects.filter(status='accepted').count()
        
        # Validations stats
        pending_validations = InternshipValidation.objects.filter(status='pending').count()
        
        data = {
        "users": {"total": total_users, "students": total_students, "companies": total_companies},
        "offers": {"total": total_offers, "active": active_offers},
        "applications": {"total": total_applications, "accepted": accepted_applications},
        "validations": {"pending": pending_validations}
        }
        return Response(data)



class PendingValidationListView(generics.ListAPIView):
    """
    GET /api/admin/validations/
    All pending internship validations queue
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = InternshipValidationListSerializer

    def get_queryset(self):
        return InternshipValidation.objects.filter(status='pending').select_related(
            'application__student__user',
            'application__offer__company__user',
        )


class ValidationDetailView(generics.RetrieveAPIView):
    """
    GET /api/admin/validations/:id/
    Validation detail
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = InternshipValidationDetailSerializer
    queryset = InternshipValidation.objects.select_related(
        'application__student__user',
        'application__offer__company__user',
        'validated_by'
    )


class ValidationApproveView(APIView):
    """
    POST /api/admin/validations/:id/approve/
    Approve validation + auto-generate Convention PDF
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            validation = InternshipValidation.objects.select_related('application__student', 'application__offer__company').get(pk=pk)
        except InternshipValidation.DoesNotExist:
            return Response({"error": "Validation not found"}, status=404)

        if validation.status != 'pending':
            return Response(
                {"error": f"Cannot approve a validation with status {validation.status}"},
                status=400
            )

        serializer = InternshipValidationApproveSerializer(validation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Mark as approved
        validation.status = 'approved'
        validation.validated_by = request.user
        validation.feedback = serializer.validated_data.get('feedback', '')
        validation.save()

        # Update application status
        application = validation.application
        application.status = 'accepted'
        application.save()

        # Auto-generate Convention PDF
        try:
            ConventionService.generate_convention(application)
        except Exception as e:
            return Response({
                "message": "Validation approved, but failed to auto-generate Convention PDF.", 
                "details": str(e)
            }, status=500)

        return Response({"message": "Validation approved and convention auto-generated successfully."})


class ValidationRejectView(APIView):
    """
    POST /api/admin/validations/:id/reject/
    Reject validation with a required reason
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            validation = InternshipValidation.objects.select_related('application').get(pk=pk)
        except InternshipValidation.DoesNotExist:
            return Response({"error": "Validation not found"}, status=404)

        if validation.status != 'pending':
            return Response(
                {"error": f"Cannot reject a validation with status {validation.status}"},
                status=400
            )

        serializer = InternshipValidationRejectSerializer(validation, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Mark as rejected
        validation.status = 'rejected'
        validation.validated_by = request.user
        validation.feedback = serializer.validated_data['feedback']
        validation.save()

        # Update application status
        application = validation.application
        application.status = 'rejected'
        application.save()

        return Response({"message": "Validation rejected successfully."})


class AdminDocumentsListView(generics.ListAPIView):
    """
    GET /api/admin/documents/
    All generated documents
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = ConventionSerializer
    queryset = Convention.objects.all().select_related(
        'student__user', 'company__user', 'offer', 'application'
    )
    


class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/
    All students list
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserListSerializer

    def get_queryset(self):
        return User.objects.filter(role='student').select_related('student_profile')


class AdminUserStatusView(generics.UpdateAPIView):
    """
    PATCH /api/admin/users/:id/status/
    Activate / deactivate a user
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminUserStatusSerializer
    queryset = User.objects.all()


class AdminCompanyListView(generics.ListAPIView):
    """
    GET /api/admin/companies/
    All companies list
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminCompanyListSerializer
    queryset = Company.objects.all().select_related('user')


class AdminCompanyVerifyView(generics.UpdateAPIView):
    """
    PATCH /api/admin/companies/:id/verify/
    Verify a company
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminCompanyVerifySerializer
    queryset = Company.objects.all()


class AdminSpecialitiesListView(generics.ListAPIView):
    """
    GET /api/admin/specialities/
    Manage domains, specialities, competencies
    """
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminDomainTreeSerializer
    
    def get_queryset(self):
        return Domain.objects.prefetch_related('specialities__competencies')


class PortfolioSubmissionReviewView(APIView):
    """
    POST /api/admin/portfolio/:submission_id/review/
    Approve or reject a portfolio submission
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            submission = PortfolioSubmission.objects.get(pk=pk)
        except PortfolioSubmission.DoesNotExist:
            return Response({"error": "Portfolio submission not found"}, status=404)
            
        if submission.status != 'pending':
            return Response({"error": f"Submission already {submission.status}"}, status=400)
            
        serializer = PortfolioSubmissionReviewSerializer(submission, data=request.data)
        serializer.is_valid(raise_exception=True)
        
        status_val = serializer.validated_data['status']
        feedback = serializer.validated_data.get('feedback', '')
        
        submission.status = status_val
        submission.feedback = feedback
        from django.utils import timezone
        submission.reviewed_at = timezone.now()
        submission.save()
            
        return Response({"message": f"Portfolio submission {status_val} successfully."})
