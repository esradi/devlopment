from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.api.permissions import IsCompany
from apps.offers.models import Offer, Application
from apps.conventions.models import Convention
from apps.matching.models import MatchScore
from apps.accounts.models import Company
from .models import CompanyDocument, Interview
from .serializers import (
    CompanyLogoSerializer, CompanyVerificationStatusSerializer,
    CompanyApplicationListSerializer, CompanyApplicationStatusSerializer,
    CompanyApplicationNoteSerializer, InterviewSerializer, 
    InterviewScheduleSerializer, InterviewFeedbackSerializer,
    CompanyConventionListSerializer, CompanyConventionSignSerializer,
    CompanyProfileSerializer, CompanyUpdateSerializer
)
from django.db.models import Count, Avg, F, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import calendar

def build_file_url(request, file_field):
    if file_field and hasattr(file_field, 'url'):
        return request.build_absolute_uri(file_field.url)
    return None


# --- 1. PROFILE MANAGEMENT ---

class CompanyProfileView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        serializer = CompanyProfileSerializer(company)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        company = request.user.company_profile
        serializer = CompanyUpdateSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_serializer = CompanyProfileSerializer(company)
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyLogoView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        company = request.user.company_profile
        serializer = CompanyLogoSerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Logo uploaded successfully",
                "logo_url": request.build_absolute_uri(company.logo.url) if company.logo else None
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        company = request.user.company_profile
        if company.logo:
            company.logo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"error": "No logo to delete"}, status=status.HTTP_400_BAD_REQUEST)


class CompanyVerificationRequestView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        company = request.user.company_profile
        description = request.data.get('company_description')
        if description:
            company.description = description

        nif_file = request.FILES.get('nif_document')
        if nif_file: CompanyDocument.objects.create(company=company, document_type='nif', file=nif_file)

        rc_file = request.FILES.get('registre_commerce')
        if rc_file: CompanyDocument.objects.create(company=company, document_type='registre_commerce', file=rc_file)

        additional_files = request.FILES.getlist('additional_documents')
        for f in additional_files:
            CompanyDocument.objects.create(company=company, document_type='other', file=f)

        company.verification_status = 'pending_verification'
        company.save()

        return Response({
            "message": "Demande de vérification envoyée aux administrateurs",
            "status": company.verification_status,
            "submitted_at": timezone.now(),
            "estimated_review_time": "2-3 jours ouvrables"
        }, status=status.HTTP_201_CREATED)


class CompanyVerificationStatusView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        serializer = CompanyVerificationStatusSerializer(request.user.company_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CompanyProfileCompletenessView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        missing_fields = []
        suggestions = []
        
        basic_score = 100
        if not company.company_name:
            basic_score = 0
            missing_fields.append('company_name')

        docs_types = set(CompanyDocument.objects.filter(company=company).values_list('document_type', flat=True))
        legal_score = 0
        if 'nif' in docs_types and 'registre_commerce' in docs_types:
            legal_score = 100
        else:
            if 'nif' not in docs_types: missing_fields.append('nif_document')
            if 'registre_commerce' not in docs_types: missing_fields.append('registre_commerce')

        desc_score = 0
        if company.description:
            if len(company.description) > 50: desc_score = 100
            else:
                desc_score = 50
                suggestions.append("Complétez votre description pour attirer plus de candidats")
        else: missing_fields.append('description')

        logo_score = 100 if company.logo else 0
        if not company.logo:
            missing_fields.append('logo')
            suggestions.append("Ajoutez un logo pour augmenter votre visibilité de 40%")

        social_score = 0
        if company.website: social_score = 100
        else: missing_fields.append('website')

        total_score = int((basic_score * 0.2) + (legal_score * 0.3) + (desc_score * 0.2) + (logo_score * 0.2) + (social_score * 0.1))

        return Response({
            "completeness": total_score,
            "breakdown": {"basic_info": basic_score, "legal_docs": legal_score, "description": desc_score, "logo": logo_score, "social_links": social_score},
            "missing_fields": missing_fields,
            "suggestions": suggestions
        }, status=status.HTTP_200_OK)


# --- 2. DASHBOARD & ANALYTICS ---

class CompanyDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        offers = Offer.objects.filter(company=company)
        applications = Application.objects.filter(offer__company=company)
        conventions = Convention.objects.filter(offer__company=company)

        avg_score = MatchScore.objects.filter(offer__company=company).aggregate(avg=Avg('total_score'))['avg']

        stats = {
            "active_offers": offers.filter(status='active').count(),
            "closed_offers": offers.filter(status='closed').count(),
            "total_applications": applications.count(),
            "applications_pending": applications.filter(status='pending').count(),
            "applications_accepted": applications.filter(status='accepted').count(),
            "applications_refused": applications.filter(status='rejected').count(),
            "conventions_generated": conventions.count(),
            "conventions_signed": conventions.filter(student_signed=True, company_signed=True).count(),
            "conventions_validated": conventions.filter(status='validated').count(),
            "avg_match_score": round(avg_score, 1) if avg_score else 0.0
        }

        recent_applications = []
        for app in applications.select_related('student__user', 'offer').order_by('-created_at')[:10]:
            match = MatchScore.objects.filter(student=app.student, offer=app.offer).first()
            recent_applications.append({
                "id": app.id,
                "student_name": app.student.user.get_full_name() or app.student.user.username,
                "student_photo": build_file_url(request, app.student.profile_picture),
                "offer_title": app.offer.title,
                "match_score": match.total_score if match else 0,
                "status": app.status,
                "applied_at": app.created_at,
                "is_new": app.status == 'pending',
                "cv_url": build_file_url(request, app.student.cv)
            })

        top_offers = []
        for o in offers.annotate(apps_count=Count('applications')).order_by('-apps_count')[:5]:
            acc_rate = (o.applications.filter(status='accepted').count() / o.apps_count * 100) if o.apps_count > 0 else 0
            top_offers.append({
                "offer_id": o.id, "offer_title": o.title, "applications_count": o.apps_count,
                "pending_count": o.applications.filter(status='pending').count(), "acceptance_rate": round(acc_rate, 1)
            })

        best_matched = []
        best_matches_qs = MatchScore.objects.filter(offer__company=company, student__applications__offer=F('offer'), student__applications__status='pending').select_related('student__user', 'offer').order_by('-total_score')[:10]
        for match in best_matches_qs:
            app = Application.objects.filter(student=match.student, offer=match.offer).first()
            if not app: continue
            best_matched.append({
                "application_id": app.id, "student_id": match.student.id, "student_name": match.student.user.get_full_name(),
                "student_photo": build_file_url(request, match.student.profile_picture), "offer_title": match.offer.title,
                "match_score": match.total_score, "verified_skills_count": match.student.studentskill_set.filter(is_verified=True).count(),
                "total_skills_required": match.offer.skills.count(), "status": app.status
            })

        pending_actions = {
            "applications_to_review": applications.filter(status='pending').count(),
            "conventions_to_sign": conventions.filter(student_signed=True, company_signed=False).count(),
            "interviews_to_schedule": 0, 
            "expired_offers": 0 
        }

        activities = []
        for app in applications.select_related('student__user', 'offer').order_by('-created_at')[:10]:
            activities.append({"type": "new_application", "message": f"{app.student.user.get_full_name()} a postulé pour {app.offer.title}", "timestamp": app.created_at, "link": f"/applications/{app.id}"})
        for conv in conventions.select_related('student__user').filter(student_signed=True).order_by('-student_signed_at')[:10]:
            activities.append({"type": "convention_signed", "message": f"{conv.student.user.get_full_name()} a signé la convention", "timestamp": conv.student_signed_at, "link": f"/conventions/{conv.id}"})
        activities.sort(key=lambda x: x["timestamp"], reverse=True)

        return Response({
            "stats": stats, "recent_applications": recent_applications, "top_offers_by_applications": top_offers,
            "best_matched_candidates": best_matched, "pending_actions": pending_actions, "activity_timeline": activities[:20]
        })

class CompanyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        applications = Application.objects.filter(offer__company=company)

        six_months_ago = timezone.now() - timedelta(days=180)
        trend_qs = applications.filter(created_at__gte=six_months_ago).annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')
        trend_data = []
        for t in trend_qs:
            month_date = t['month']
            month_apps = applications.filter(created_at__year=month_date.year, created_at__month=month_date.month)
            trend_data.append({
                "month": f"{calendar.month_abbr[month_date.month]} {month_date.year}", "count": t['count'],
                "accepted": month_apps.filter(status='accepted').count(), "refused": month_apps.filter(status='rejected').count()
            })

        total_apps = applications.count()
        status_data = {"pending": applications.filter(status='pending').count(), "accepted": applications.filter(status='accepted').count(), "refused": applications.filter(status='rejected').count(), "withdrawn": 0}

        spec_qs = applications.values('student__speciality').annotate(count=Count('id')).order_by('-count')[:5]
        specialities = [{"speciality": s['student__speciality'] or "Non spécifié", "count": s['count']} for s in spec_qs]

        scores = MatchScore.objects.filter(offer__company=company).values_list('total_score', flat=True)
        dist = {"90-100": len([s for s in scores if s >= 90]), "80-89": len([s for s in scores if 80 <= s < 90]), "70-79": len([s for s in scores if 70 <= s < 80]), "60-69": len([s for s in scores if 60 <= s < 70]), "below_60": len([s for s in scores if s < 60])}

        conventions = Convention.objects.filter(offer__company=company)
        funnel = {"views": total_apps * 3, "applications": total_apps, "interviews": int(total_apps * 0.4), "acceptances": status_data['accepted'], "signed_conventions": conventions.filter(student_signed=True, company_signed=True).count(), "completed_internships": conventions.filter(status='validated').count()}

        return Response({
            "applications_trend": trend_data, "applications_by_status": status_data, "applications_by_speciality": specialities,
            "top_skills_demand": [], "match_score_distribution": dist, "conversion_funnel": funnel,
            "performance_metrics": {"avg_time_to_hire": 15.3, "acceptance_rate": round((status_data['accepted'] / total_apps * 100) if total_apps > 0 else 0, 1), "candidate_quality_score": round(sum(scores) / len(scores) if scores else 0, 1)}
        })

class CompanyStatsView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        today = timezone.now().date()
        total_apps = Application.objects.filter(offer__company=company).count()
        avg_score = MatchScore.objects.filter(offer__company=company).aggregate(avg=Avg('total_score'))['avg']
        
        return Response({
            "active_offers": Offer.objects.filter(company=company, status='active').count(),
            "total_applications_today": Application.objects.filter(offer__company=company, created_at__date=today).count(),
            "pending_review": Application.objects.filter(offer__company=company, status='pending').count(),
            "acceptance_rate": round((Application.objects.filter(offer__company=company, status='accepted').count() / total_apps * 100) if total_apps > 0 else 0, 1),
            "avg_match_score": round(avg_score, 1) if avg_score else 0.0,
            "new_notifications": 0 
        })


# --- 3. APPLICATION MANAGEMENT ---

class CompanyApplicationListView(generics.ListAPIView):
    serializer_class = CompanyApplicationListSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        queryset = Application.objects.filter(offer__company=self.request.user.company_profile).select_related('student__user', 'offer')
        status_filter = self.request.query_params.get('status')
        offer_id = self.request.query_params.get('offer_id')
        search = self.request.query_params.get('search')

        if status_filter: queryset = queryset.filter(status=status_filter)
        if offer_id: queryset = queryset.filter(offer_id=offer_id)
        if search: queryset = queryset.filter(Q(student__user__first_name__icontains=search) | Q(student__user__last_name__icontains=search) | Q(student__user__email__icontains=search))
        return queryset.order_by('-created_at')

class CompanyApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk, offer__company=request.user.company_profile)
        serializer = CompanyApplicationStatusSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": f"Application status updated to {application.status}", "application": CompanyApplicationListSerializer(application).data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyApplicationNoteView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request, pk):
        application = get_object_or_404(Application, pk=pk, offer__company=request.user.company_profile)
        serializer = CompanyApplicationNoteSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Notes saved successfully", "company_notes": application.company_notes}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk): return self.post(request, pk)


# --- 4. INTERVIEW MANAGEMENT ---

class CompanyInterviewScheduleView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        # We also want to auto-assign the company
        data = request.data.copy()
        serializer = InterviewScheduleSerializer(data=data)
        if serializer.is_valid():
            # Validate application belongs to company
            application = serializer.validated_data['application']
            if application.offer.company != request.user.company_profile:
                return Response({"error": "Application does not belong to your company."}, status=status.HTTP_403_FORBIDDEN)
            
            interview = serializer.save(company=request.user.company_profile)
            return Response({
                "message": "Interview scheduled successfully.",
                "interview": InterviewSerializer(interview).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyInterviewListView(generics.ListAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        company = self.request.user.company_profile
        queryset = Interview.objects.filter(company=company)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            queryset = queryset.filter(scheduled_at__gte=timezone.now()).order_by('scheduled_at')
        else:
            queryset = queryset.order_by('-scheduled_at')
            
        return queryset

class CompanyInterviewFeedbackView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def patch(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, company=request.user.company_profile)
        serializer = InterviewFeedbackSerializer(interview, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Interview feedback saved.",
                "interview": InterviewSerializer(interview).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyInterviewManageView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, company=request.user.company_profile)
        serializer = InterviewSerializer(interview)
        return Response(serializer.data)

    def delete(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, company=request.user.company_profile)
        interview.status = 'cancelled'
        interview.save()
        return Response({"message": "Interview cancelled successfully."}, status=status.HTTP_200_OK)

class CompanyInterviewCompleteView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, company=request.user.company_profile)
        serializer = InterviewFeedbackSerializer(interview, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(status='completed')
            return Response({
                "message": "Interview completed successfully.",
                "interview": InterviewSerializer(interview).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 5. CONVENTION MANAGEMENT ---

class CompanyConventionListView(generics.ListAPIView):
    serializer_class = CompanyConventionListSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        company = self.request.user.company_profile
        queryset = Convention.objects.filter(company=company).select_related('student__user', 'offer')
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

class CompanyConventionDetailView(generics.RetrieveAPIView):
    serializer_class = CompanyConventionListSerializer
    permission_classes = [IsAuthenticated, IsCompany]

    def get_queryset(self):
        company = self.request.user.company_profile
        return Convention.objects.filter(company=company).select_related('student__user', 'offer')

class CompanyConventionStatsView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.company_profile
        conventions = Convention.objects.filter(company=company)
        
        return Response({
            "total": conventions.count(),
            "pending_student_signature": conventions.filter(status='pending_student_signature').count(),
            "pending_company_signature": conventions.filter(status='pending_company_signature').count(),
            "pending_admin_validation": conventions.filter(status='pending_admin_validation').count(),
            "validated": conventions.filter(status='validated').count(),
            "rejected": conventions.filter(status='rejected').count()
        })

from apps.conventions.views import verify_webauthn_for_user, get_client_ip

class CompanyConventionSignView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def patch(self, request, pk):
        convention = get_object_or_404(Convention, pk=pk, company=request.user.company_profile)
        
        # Only allow signing if it's in the pending_company_signature state
        if convention.status != 'pending_company_signature':
            return Response({
                "error": f"Cannot sign convention in '{convention.get_status_display()}' state. Must be 'Pending Company'."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        if not request.data.get('confirmed'):
            return Response(
                {'error': 'You must confirm the terms before signing'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        webauthn_response = request.data.get('webauthn_response')
        if not webauthn_response:
            return Response(
                {'error': 'Fingerprint authentication data (webauthn_response) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        is_valid, result_or_error = verify_webauthn_for_user(request, request.user, webauthn_response)
        if not is_valid:
            return Response({'error': f'Fingerprint authentication failed: {result_or_error}'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.conventions.services.convention_service import ConventionService
        from apps.notifications.services import NotificationService

        convention.company_signed = True
        convention.company_signed_at = timezone.now()
        convention.company_fingerprint_authenticated = True
        convention.company_authentication_timestamp = str(timezone.now().timestamp())
        convention.company_credential_id = result_or_error
        convention.company_ip_address = get_client_ip(request)
        convention.company_user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Auto-advance the convention state
        if convention.student_signed:
            convention.status = 'pending_admin_validation'
        else:
            convention.status = 'pending_student_signature'
            
        convention.save()
        
        # Trigger PDF regeneration and Notifications
        ConventionService.regenerate_pdf(convention)
        NotificationService.notify_convention_company_signed(convention)
        
        return Response({
            "message": "Convention signed successfully with Fingerprint",
            "convention": CompanyConventionListSerializer(convention).data
        }, status=status.HTTP_200_OK)

# --- 6. STUDENT SEARCH (SOURCING) ---

from apps.accounts.models import Student

class CompanyStudentSearchView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        queryset = Student.objects.select_related('user').all()
        
        speciality = request.query_params.get('speciality')
        if speciality:
            queryset = queryset.filter(speciality__icontains=speciality)
            
        degree_level = request.query_params.get('degree_level')
        if degree_level:
            queryset = queryset.filter(degree_level__icontains=degree_level)
            
        wilaya = request.query_params.get('wilaya')
        if wilaya:
            queryset = queryset.filter(wilaya__icontains=wilaya)
            
        min_gpa = request.query_params.get('min_gpa')
        if min_gpa:
            try:
                queryset = queryset.filter(gpa__gte=float(min_gpa))
            except ValueError:
                pass
                
        skills = request.query_params.get('skills')
        verified_only = request.query_params.get('verified_only') == 'true'
        
        if skills:
            skill_list = [s.strip() for s in skills.split(',')]
            for skill in skill_list:
                if verified_only:
                    queryset = queryset.filter(studentskill_set__skill__name__icontains=skill, studentskill_set__is_verified=True)
                else:
                    queryset = queryset.filter(studentskill_set__skill__name__icontains=skill)
                    
        # Filter by minimum match score for company's active offers
        min_match_score = request.query_params.get('min_match_score')
        company = request.user.company_profile
        
        results = []
        for student in queryset.distinct():
            best_score = 0
            if min_match_score:
                try:
                    min_score_val = float(min_match_score)
                    active_offers = Offer.objects.filter(company=company, status='active')
                    for offer in active_offers:
                        match = MatchScore.objects.filter(student=student, offer=offer).first()
                        score = match.total_score if match else 0
                        if score > best_score:
                            best_score = score
                            
                    if best_score < min_score_val:
                        continue # Skip this student
                except ValueError:
                    pass
            
            verified_skills_qs = student.studentskill_set.filter(is_verified=True).select_related('skill')
            verified_skills = [{"name": s.skill.name} for s in verified_skills_qs]
            
            results.append({
                "student_id": student.id,
                "full_name": student.user.get_full_name(),
                "photo": build_file_url(request, student.profile_picture),
                "university": student.university,
                "speciality": student.speciality,
                "degree_level": student.degree_level,
                "gpa": student.gpa,
                "verified_skills": verified_skills,
                "total_verified_skills": len(verified_skills),
                "best_match_score": best_score,
                "cv_url": build_file_url(request, student.cv),
                "can_contact": True
            })
            
        if min_match_score:
            results.sort(key=lambda x: x['best_match_score'], reverse=True)
            
        return Response({
            "count": len(results),
            "results": results
        })

# --- 7. TEAM MANAGEMENT ---

from django.contrib.auth import get_user_model
from django.db import transaction
import random
import string
from .models import CompanyTeamMember
from .serializers import CompanyTeamMemberSerializer

User = get_user_model()

def generate_random_password(length=12):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(random.choice(characters) for i in range(length))

class CompanyTeamListView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def get(self, request):
        company = request.user.get_company()
        if not company:
            return Response({'error': 'No company associated with this user.'}, status=status.HTTP_400_BAD_REQUEST)
            
        team_members = CompanyTeamMember.objects.filter(company=company)
        serializer = CompanyTeamMemberSerializer(team_members, many=True)
        
        # Also include the creator
        creator_data = {
            "id": company.user.id,
            "email": company.user.email,
            "first_name": company.user.first_name,
            "last_name": company.user.last_name,
            "role": "creator",
            "is_creator": True
        }
        
        return Response({
            "creator": creator_data,
            "team_members": serializer.data
        })

    @transaction.atomic
    def post(self, request):
        # Invite colleague
        if not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only the company creator can invite team members.'}, status=status.HTTP_403_FORBIDDEN)
        company = request.user.company_profile
            
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'recruiter')
        permissions = request.data.get('permissions', {})
        
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create user
        temp_password = generate_random_password()
        new_user = User.objects.create_user(
            username=email,
            email=email,
            password=temp_password,
            first_name=first_name,
            last_name=last_name,
            role='company',
            email_verified=True # Auto-verified for team members
        )
        
        # Create team member link
        team_member = CompanyTeamMember.objects.create(
            user=new_user,
            company=company,
            role=role,
            can_create_offers=permissions.get('can_create_offers', True),
            can_edit_offers=permissions.get('can_edit_offers', True),
            can_delete_offers=permissions.get('can_delete_offers', False),
            can_view_applications=permissions.get('can_view_applications', True),
            can_accept_applications=permissions.get('can_accept_applications', True),
            can_refuse_applications=permissions.get('can_refuse_applications', True),
            can_sign_conventions=permissions.get('can_sign_conventions', False),
            can_invite_team_members=permissions.get('can_invite_team_members', False)
        )
        
        # Send email to new user with temp_password
        from apps.api.utils import send_team_invite_email
        send_team_invite_email(email, company.company_name, temp_password)
        
        return Response({
            "message": f"Invitation sent to {email}",
            "temp_password": temp_password, # In production, DO NOT return this, send via email only
            "team_member": CompanyTeamMemberSerializer(team_member).data
        }, status=status.HTTP_201_CREATED)

class CompanyTeamDetailView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def put(self, request, pk):
        if not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only the company creator can modify team members.'}, status=status.HTTP_403_FORBIDDEN)
        company = request.user.company_profile
            
        team_member = get_object_or_404(CompanyTeamMember, user_id=pk, company=company)
        
        permissions = request.data.get('permissions', {})
        role = request.data.get('role')
        if role:
            team_member.role = role
            
        for key, value in permissions.items():
            if hasattr(team_member, key):
                setattr(team_member, key, value)
                
        team_member.save()
        return Response({
            "message": "Permissions updated",
            "team_member": CompanyTeamMemberSerializer(team_member).data
        })
        
    def delete(self, request, pk):
        if not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only the company creator can remove team members.'}, status=status.HTTP_403_FORBIDDEN)
        company = request.user.company_profile
            
        team_member = get_object_or_404(CompanyTeamMember, user_id=pk, company=company)
        user_to_delete = team_member.user
        team_member.delete()
        user_to_delete.delete() # Also delete the user account
        
        return Response({"message": "Team member removed successfully."}, status=status.HTTP_200_OK)

class CompanyTeamActivityView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]
    
    def get(self, request):
        return Response({
            "message": "Team activity history (placeholder)",
            "activities": []
        })
