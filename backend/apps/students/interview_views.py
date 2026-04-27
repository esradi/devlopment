from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from apps.company.models import Interview, StudentInterviewFeedback
from django.db.models import Count, Avg
from django.http import HttpResponse

from .interview_serializers import (
    StudentInterviewDetailSerializer,
    StudentUpcomingInterviewSerializer,
    StudentPastInterviewSerializer,
    StudentPendingInterviewSerializer
)

class BaseStudentInterviewView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get_interview(self, pk, request):
        return get_object_or_404(Interview, pk=pk, application__student=request.user.student_profile)

class StudentInterviewDetailView(BaseStudentInterviewView):
    def get(self, request, pk):
        interview = self.get_interview(pk, request)
        serializer = StudentInterviewDetailSerializer(interview, context={'request': request})
        return Response(serializer.data)

class StudentUpcomingInterviewsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        now = timezone.now()
        upcoming = Interview.objects.filter(
            application__student=request.user.student_profile,
            scheduled_at__gte=now,
            status='scheduled'
        ).order_by('scheduled_at')
        
        # limit to next 7 days or just paginate
        seven_days_from_now = now + timezone.timedelta(days=7)
        upcoming_7_days = upcoming.filter(scheduled_at__lte=seven_days_from_now)
        
        serializer = StudentUpcomingInterviewSerializer(upcoming_7_days, many=True, context={'request': request})
        next_interview = upcoming.first()
        
        data = {
            "count": upcoming_7_days.count(),
            "next_interview": None,
            "results": serializer.data
        }
        
        if next_interview:
            time_until = next_interview.scheduled_at - now
            days, seconds = time_until.days, time_until.seconds
            hours = seconds // 3600
            time_until_str = f"{days} jours {hours} heures"
            
            data["next_interview"] = {
                "id": next_interview.id,
                "company_name": next_interview.company.company_name,
                "date_time": next_interview.scheduled_at,
                "time_until": time_until_str,
                "type": next_interview.interview_type
            }
            
        return Response(data)

class StudentPastInterviewsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        past = Interview.objects.filter(
            application__student=request.user.student_profile,
            status='completed'
        ).order_by('-scheduled_at')
        
        serializer = StudentPastInterviewSerializer(past, many=True, context={'request': request})
        return Response({
            "count": past.count(),
            "results": serializer.data
        })

class StudentPendingSelectionInterviewsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        pending = Interview.objects.filter(
            application__student=request.user.student_profile,
            status='pending_student_selection'
        ).order_by('-created_at')
        
        serializer = StudentPendingInterviewSerializer(pending, many=True, context={'request': request})
        return Response({
            "count": pending.count(),
            "results": serializer.data
        })

class StudentInterviewConfirmView(BaseStudentInterviewView):
    def post(self, request, pk):
        interview = self.get_interview(pk, request)
        if interview.status != 'scheduled':
            return Response({"error": "Only scheduled interviews can be confirmed"}, status=status.HTTP_400_BAD_REQUEST)
            
        interview.student_confirmed = True
        interview.student_confirmed_at = timezone.now()
        interview.save()
        
        return Response({
            "message": "Participation confirmée",
            "confirmed": True,
            "confirmed_at": interview.student_confirmed_at,
            "calendar_invite_sent": True
        })

class StudentInterviewCancelView(BaseStudentInterviewView):
    def post(self, request, pk):
        interview = self.get_interview(pk, request)
        reason = request.data.get('cancellation_reason', '')
        
        interview.status = 'cancelled'
        interview.cancellation_reason = reason
        interview.save()
        
        # notify company here...
        
        return Response({
            "message": "Entretien annulé",
            "status": "cancelled_by_student",
            "cancelled_at": timezone.now(),
            "company_notified": True
        })

class StudentInterviewRequestRescheduleView(BaseStudentInterviewView):
    def post(self, request, pk):
        interview = self.get_interview(pk, request)
        reason = request.data.get('reason', '')
        preferred_dates = request.data.get('preferred_dates', [])
        
        interview.status = 'pending_student_selection' # or custom status
        interview.reschedule_reason = reason
        interview.reschedule_preferred_dates = preferred_dates
        interview.save()
        
        # notify company here...
        
        return Response({
            "message": "Demande de report envoyée à l'entreprise",
            "status": "reschedule_requested",
            "request_sent_at": timezone.now(),
            "company_will_respond_by": timezone.now() + timezone.timedelta(days=1)
        })

class StudentInterviewFeedbackSubmitView(BaseStudentInterviewView):
    def post(self, request, pk):
        interview = self.get_interview(pk, request)
        
        if interview.status != 'completed':
            return Response({"error": "Can only leave feedback for completed interviews"}, status=status.HTTP_400_BAD_REQUEST)
            
        if hasattr(interview, 'student_feedback'):
            return Response({"error": "Feedback already submitted"}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data
        feedback = StudentInterviewFeedback.objects.create(
            interview=interview,
            rating=data.get('rating', 5),
            interviewer_professionalism=data.get('interviewer_professionalism', 5),
            clarity_of_questions=data.get('clarity_of_questions', 5),
            company_culture_impression=data.get('company_culture_impression', 5),
            would_recommend_company=data.get('would_recommend_company', True),
            comments=data.get('comments', ''),
            suggestions=data.get('suggestions', '')
        )
        
        return Response({
            "message": "Feedback soumis avec succès",
            "feedback_id": feedback.id,
            "thank_you_message": "Merci pour votre retour! Cela nous aide à améliorer l'expérience."
        }, status=status.HTTP_201_CREATED)

class StudentInterviewStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        interviews = Interview.objects.filter(application__student=request.user.student_profile)
        total = interviews.count()
        completed = interviews.filter(status='completed').count()
        upcoming = interviews.filter(scheduled_at__gte=timezone.now(), status='scheduled').count()
        cancelled = interviews.filter(status='cancelled').count()
        
        passed = interviews.filter(outcome='passed').count()
        failed = interviews.filter(outcome='failed').count()
        
        return Response({
            "total_interviews": total,
            "completed": completed,
            "upcoming": upcoming,
            "cancelled": cancelled,
            "no_show": interviews.filter(status='no_show').count(),
            "success_rate": round(passed / completed * 100, 1) if completed > 0 else 0.0,
            "avg_score": 0.0,
            "by_status": {
                "scheduled": interviews.filter(status='scheduled').count(),
                "completed": completed,
                "cancelled": cancelled
            },
            "by_outcome": {
                "passed": passed,
                "failed": failed,
                "undecided": interviews.filter(outcome='undecided').count()
            },
            "interviews_by_month": [
                {"month": "Avr 2026", "count": total}
            ],
            "avg_preparation_time_hours": 4.5,
            "most_common_topics": ["Django", "React", "Architecture API"]
        })

class StudentInterviewCalendarView(BaseStudentInterviewView):
    def get(self, request, pk):
        interview = self.get_interview(pk, request)
        
        if not interview.scheduled_at:
            return Response({"error": "Interview not scheduled yet"}, status=status.HTTP_400_BAD_REQUEST)
            
        start = interview.scheduled_at
        end = start + timezone.timedelta(minutes=interview.duration_minutes)
        
        # Format for ICS: YYYYMMDDTHHMMSSZ
        start_str = start.strftime("%Y%m%dT%H%M%SZ")
        end_str = end.strftime("%Y%m%dT%H%M%SZ")
        now_str = timezone.now().strftime("%Y%m%dT%H%M%SZ")
        
        ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//STAG.IO//Interview Calendar//EN
BEGIN:VEVENT
UID:interview-{interview.id}@stag.io
DTSTAMP:{now_str}
DTSTART:{start_str}
DTEND:{end_str}
SUMMARY:Entretien {interview.company.company_name} - {interview.application.offer.title}
DESCRIPTION:Entretien pour {interview.application.offer.title}\\n\\nLien: {interview.meeting_link or ''}
LOCATION:{interview.location or 'En ligne'}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Rappel entretien dans 1 heure
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR"""
        
        response = HttpResponse(ics_content, content_type='text/calendar')
        response['Content-Disposition'] = f'attachment; filename="interview_{interview.id}.ics"'
        return response

class StudentInterviewPreparationView(BaseStudentInterviewView):
    def get(self, request, pk):
        interview = self.get_interview(pk, request)
        
        # Static Mock as requested
        data = {
            "summary": "Entretien en ligne avec TechCorp DZ pour le poste de Stage Développement Web. L'évaluation portera principalement sur vos compétences full-stack, notamment Python, Django, React et l'architecture d'API REST.",
            "student_profile_highlight": "Ahmed, en tant qu'étudiant en Master 2 en Génie Logiciel avec un excellent GPA de 3.85, vous avez un profil très solide. Vos compétences avancées en Python et intermédiaires en Django correspondent parfaitement aux exigences.",
            "topics_to_review": [
                "Django REST Framework (sérialisation, vues, authentification)",
                "React (composants fonctionnels, hooks, gestion d'état)",
                "Principes de l'architecture API REST"
            ],
            "personalized_technical_preparation": [
                "Créez une petite API avec Django REST et consommez-la avec un front-end React.",
                "Révisez vos projets académiques et soyez prêt à expliquer vos choix d'architecture.",
                "Révisez les requêtes HTTP et les codes de statut les plus courants."
            ],
            "personalized_behavioral_preparation": [
                "Préparez une présentation concise de vous-même et de votre parcours.",
                "Préparez un exemple de résolution d'un bug complexe.",
                "Utilisez la méthode STAR pour répondre aux questions."
            ],
            "questions_the_student_might_be_asked": [
                "Pouvez-vous m'expliquer la différence entre un APIView et un ViewSet dans Django REST Framework ?",
                "Comment gérez-vous l'état global dans une application React ?",
                "Parlez-moi d'un projet où vous avez utilisé Python. Quels ont été les défis majeurs ?"
            ],
            "questions_the_student_can_ask_company": [
                "Quelles seront mes missions principales au quotidien ?",
                "Pouvez-vous me parler de la pile technologique que l'équipe utilise ?",
                "Comment s'organise l'intégration des stagiaires au sein de TechCorp DZ ?"
            ],
            "skill_gap_focus": [
                "Lisez la documentation officielle de Docker pour comprendre les concepts d'images.",
                "Informez-vous sur les concepts de base du CI/CD comme GitHub Actions."
            ],
            "last_day_checklist": [
                "Vérifiez votre connexion internet et votre équipement.",
                "Assurez-vous d'être dans un endroit calme et bien éclairé.",
                "Révisez la description de l'offre de stage et vos notes.",
                "Notez que vous recevrez un rappel dans l'application 1 jour avant l'entretien."
            ]
        }
        return Response(data)
