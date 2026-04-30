from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from itertools import chain

from apps.admin_panel.models import InternshipValidation, AdminActionLog
from apps.accounts.models import Company
from apps.conventions.models import Convention
from apps.conventions.services.convention_service import ConventionService
from apps.admin_panel.utils import log_admin_action
from apps.admin_panel.serializers import (
    InternshipValidationSerializer,
    AdminUserSerializer,
    AdminCompanySerializer,
    AdminActionLogSerializer
)

User = get_user_model()

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        from apps.accounts.models import Student, Company, User
        from apps.offers.models import Offer, Application
        from apps.conventions.models import Convention
        from apps.company.models import Interview
        from apps.admin_panel.serializers import AdminUserSerializer, AdminCompanySerializer
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_week = start_of_week + timedelta(days=6, hours=23, minutes=59, seconds=59)

        # 1. Core Totals
        total_students = Student.objects.count()
        students_with_internship = Convention.objects.filter(status='validated').values('student').distinct().count()
        
        # 2. Verification Queue (Actionable)
        pending_id_verifications = User.objects.filter(role='student', id_verified=False).exclude(Q(national_id_card='') | Q(national_id_card__isnull=True)).count()
        pending_company_validations = Company.objects.filter(verification_status='pending').count()

        # 3. Offer Health
        offers_with_no_apps = Offer.objects.annotate(app_count=Count('applications')).filter(app_count=0).count()
        expired_active_offers = Offer.objects.filter(status='active', deadline__lt=now).count()

        # 4. Convention Progress
        waiting_student = Convention.objects.filter(status='pending_student_signature').count()
        waiting_company = Convention.objects.filter(status='pending_company_signature').count()

        # 5. Document Completeness
        students_no_cv = Student.objects.filter(Q(cv='') | Q(cv__isnull=True)).count()
        companies_no_logo = Company.objects.filter(Q(logo='') | Q(logo__isnull=True)).count()

        # 6. Heartbeat
        interviews_this_week = Interview.objects.filter(scheduled_at__range=(start_of_week, end_of_week)).count()

        return Response({
            "stats": {
                "general": {
                    "companies_count": Company.objects.count(),
                    "students_count": total_students,
                    "offers_count": Offer.objects.count(),
                    "applications_count": Application.objects.count(),
                    "students_with_internship": students_with_internship,
                    "students_without_internship": total_students - students_with_internship,
                },
                "verification_queue": {
                    "pending_student_ids": pending_id_verifications,
                    "pending_company_validations": pending_company_validations,
                },
                "offer_health": {
                    "offers_with_zero_applications": offers_with_no_apps,
                    "expired_active_offers": expired_active_offers,
                },
                "signature_progress": {
                    "waiting_for_student": waiting_student,
                    "waiting_for_company": waiting_company,
                },
                "completeness": {
                    "students_missing_cv": students_no_cv,
                    "companies_missing_logo": companies_no_logo,
                },
                "heartbeat": {
                    "interviews_this_week": interviews_this_week,
                }
            },
            "recent_companies": AdminCompanySerializer(Company.objects.order_by('-id')[:10], many=True).data,
            "recent_students": AdminUserSerializer(User.objects.filter(role='student').order_by('-id')[:10], many=True).data,
            "shortcuts": {
                "manage_users": "/api/admin/users/",
                "manage_companies": "/api/admin/companies/",
                "internship_validations": "/api/admin/internships/?status=pending"
            }
        })

class BaseAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        instance = serializer.save()
        log_admin_action(self.request, f"{instance._meta.model_name}_update", instance, serializer.validated_data)

class InternshipValidationViewSet(BaseAdminViewSet):
    serializer_class = InternshipValidationSerializer
    queryset = InternshipValidation.objects.select_related('application__student__user', 'application__offer__company__user')

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter: return qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        val = self.get_object()
        decision = request.data.get('status') # 'approved' or 'rejected'
        
        if decision not in ['approved', 'rejected']:
            return Response({"error": "Invalid status"}, status=400)

        val.status = decision
        val.feedback = request.data.get('feedback', '')
        val.validated_by = request.user
        val.save()

        app = val.application
        app.status = 'accepted' if decision == 'approved' else 'rejected'
        app.save()

        log_admin_action(request, f'internship_{decision}', val)
        
        if decision == 'approved':
            try: ConventionService.generate_convention(app)
            except: pass # Log failed PDF but continue
            
        return Response({"status": decision})

class AdminUserViewSet(BaseAdminViewSet):
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Manually verify a user's ID"""
        user = self.get_object()
        user.id_verified = True
        user.save()
        log_admin_action(request, 'user_manual_verify', user)
        return Response({'status': 'verified'})

    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        """Suspend or activate a user"""
        user = self.get_object()
        is_suspended = request.data.get('is_suspended', False)
        reason = request.data.get('reason', '')
        
        user.is_suspended = is_suspended
        user.suspension_reason = reason if is_suspended else None
        user.save()
        
        action_name = 'user_suspended' if is_suspended else 'user_activated'
        log_admin_action(request, action_name, user, {'reason': reason})
        return Response({'status': action_name, 'is_suspended': user.is_suspended})

    @action(detail=False, methods=['post'], url_path='bulk-verify')
    def bulk_verify(self, request):
        """Batch verify multiple users"""
        user_ids = request.data.get('user_ids', [])
        users = User.objects.filter(id__in=user_ids)
        count = users.update(id_verified=True)
        
        log_admin_action(request, 'user_bulk_verify', None, {'count': count, 'ids': user_ids})
        return Response({'verified_count': count})

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Drill-down: Detailed activity for a specific user"""
        user = self.get_object()
        from apps.offers.models import Application
        from apps.admin_panel.models import AdminActionLog
        from apps.admin_panel.serializers import AdminActionLogSerializer
        
        # 1. Applications (if student)
        apps_data = []
        if user.role == 'student':
            apps = Application.objects.filter(student__user=user).select_related('offer')
            apps_data = [{'id': a.id, 'offer': a.offer.title, 'status': a.status, 'date': a.created_at} for a in apps]
            
        # 2. Admin actions ON this user
        logs = AdminActionLog.objects.filter(target_model='user', target_id=str(user.id))
        logs_data = AdminActionLogSerializer(logs, many=True).data
        
        return Response({
            'user': user.email,
            'role': user.role,
            'applications': apps_data,
            'admin_history': logs_data
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export users to Excel"""
        from apps.admin_panel.exports import AdminExporter
        from django.http import HttpResponse
        
        role = request.query_params.get('role')
        queryset = self.get_queryset()
        if role:
            queryset = queryset.filter(role=role)
            
        buffer = AdminExporter.export_users_to_excel(queryset)
        
        filename = f"users_export_{timezone.now().strftime('%Y%m%d')}.xlsx"
        response = HttpResponse(
            buffer,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

class AdminCompanyViewSet(BaseAdminViewSet):
    serializer_class = AdminCompanySerializer
    queryset = Company.objects.all()

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a company profile"""
        company = self.get_object()
        company.verification_status = 'verified'
        company.verified_at = timezone.now()
        company.verified_by = request.user.email
        company.save()
        
        log_admin_action(request, 'company_verified', company)
        return Response({'status': 'verified'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a company verification"""
        company = self.get_object()
        reason = request.data.get('reason', 'Documents non conformes')
        
        company.verification_status = 'rejected'
        company.rejection_reason = reason
        company.save()
        
        log_admin_action(request, 'company_rejected', company, {'reason': reason})
        return Response({'status': 'rejected'})

class AdminActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = AdminActionLogSerializer
    queryset = AdminActionLog.objects.all()


# --- ENRICHED ANALYTICS & DASHBOARD VIEWS ---

class AdminAnalyticsView(APIView):
    """
    Admin analytics endpoint - provides historical data and trends (Simplified)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            'funnel': self._get_application_funnel(),
            'geography': self._get_geographic_data(),
            'specialities': self._get_speciality_stats(),
            'skills': self._get_skills_analysis()
        })

    def _get_application_funnel(self):
        from apps.accounts.models import Student
        from apps.offers.models import Application
        from apps.conventions.models import Convention

        total_students = Student.objects.count()
        applied = Application.objects.values('student').distinct().count()
        accepted = Application.objects.filter(status='accepted').values('student').distinct().count()
        
        # Convention stages
        signed = Convention.objects.filter(student_signed=True, company_signed=True, admin_signed=True).count()
        completed = Convention.objects.filter(status='validated', end_date__lt=timezone.now().date()).count()

        return {
            'registered': total_students,
            'applied': applied,
            'accepted': accepted,
            'signed_convention': signed,
            'completed': completed
        }

    def _get_geographic_data(self):
        from apps.accounts.models import Student
        from apps.offers.models import Offer
        
        # Count students per wilaya
        student_geo = Student.objects.exclude(wilaya__isnull=True)\
            .values('wilaya')\
            .annotate(students=Count('id'))
            
        # Count offers per wilaya
        offer_geo = Offer.objects.exclude(wilaya__isnull=True)\
            .values('wilaya')\
            .annotate(offers=Count('id'))
            
        # Merge data
        geo_dict = {}
        for s in student_geo:
            geo_dict[s['wilaya']] = {'wilaya': s['wilaya'], 'students': s['students'], 'offers': 0}
        for o in offer_geo:
            if o['wilaya'] in geo_dict:
                geo_dict[o['wilaya']]['offers'] = o['offers']
            else:
                geo_dict[o['wilaya']] = {'wilaya': o['wilaya'], 'students': 0, 'offers': o['offers']}
                
        return list(geo_dict.values())

    def _get_speciality_stats(self):
        from apps.offers.models import Application
        # Counting applications by offer's domains
        stats = Application.objects.values('offer__domains__name')\
            .annotate(applications=Count('id'))\
            .order_by('-applications')[:10]
            
        return [{'speciality': s['offer__domains__name'] or 'Unknown', 'applications': s['applications']} for s in stats]

    def _get_skills_analysis(self):
        from apps.offers.models import Offer
        from apps.accounts.models import StudentSkill
        
        # Demand: Skills required in offers
        demand = Offer.objects.values('skills__name')\
            .annotate(count=Count('id'))\
            .order_by('-count')[:20]
            
        # Supply: Skills declared by students
        supply = StudentSkill.objects.values('skill__name')\
            .annotate(count=Count('id'))
            
        supply_dict = {s['skill__name']: s['count'] for s in supply}
        
        analysis = []
        for d in demand:
            skill_name = d['skills__name']
            if skill_name:
                analysis.append({
                    'skill': skill_name,
                    'demand': d['count'],
                    'supply': supply_dict.get(skill_name, 0)
                })
        return analysis

class AdminAlertsView(APIView):
    """
    System alerts for admin attention
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from apps.offers.models import Application, Offer
        alerts = []

        # 1. Delayed Validations (> 48h)
        delayed_cutoff = timezone.now() - timedelta(hours=48)
        delayed_validations = Application.objects.filter(
            status='pending',
            created_at__lt=delayed_cutoff
        ).count()

        if delayed_validations > 0:
            alerts.append({
                'severity': 'high',
                'type': 'pending_validations',
                'message': f'{delayed_validations} validations en attente > 48h',
                'count': delayed_validations,
                'action_url': '/admin/validations'
            })

        # 2. Unverified Companies
        from apps.accounts.models import Company
        unverified_companies = Company.objects.filter(verification_status='pending').count()
        if unverified_companies > 0:
            alerts.append({
                'severity': 'medium',
                'type': 'unverified_companies',
                'message': f'{unverified_companies} entreprises en attente vérification',
                'count': unverified_companies,
                'action_url': '/admin/companies/pending'
            })
            
        return Response({'alerts': alerts})

class AdminActivityFeedView(APIView):
    """
    Chronological stream of important platform events
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        User = get_user_model()
        from apps.offers.models import Application
        from apps.conventions.models import Convention

        recent_users = User.objects.order_by('-created_at')[:15]
        recent_apps = Application.objects.select_related('student__user', 'offer').order_by('-created_at')[:15]
        recent_convs = Convention.objects.select_related('student__user', 'offer').order_by('-updated_at')[:15]

        activities = []

        for u in recent_users:
            activities.append({
                'timestamp': u.created_at,
                'type': 'registration',
                'actor': u.get_full_name() or u.email,
                'description': f"Nouveau {u.role} inscrit: {u.email}",
                'link': f"/admin/users/{u.id}"
            })

        for a in recent_apps:
            activities.append({
                'timestamp': a.created_at,
                'type': 'application_submitted',
                'actor': a.student.user.get_full_name() or a.student.user.email,
                'description': f"Nouvelle candidature pour {a.offer.title}",
                'link': f"/admin/applications/{a.id}"
            })

        for c in recent_convs:
            action_desc = "Convention mise à jour"
            if c.status == 'validated': action_desc = "Convention validée par l'admin"
            elif c.status == 'pending_company_signature': action_desc = "Convention signée par l'étudiant"
            
            activities.append({
                'timestamp': c.updated_at,
                'type': 'convention_update',
                'actor': c.student.user.get_full_name() or c.student.user.email,
                'description': action_desc,
                'link': f"/admin/conventions/{c.id}"
            })

        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        return Response({'activities': activities[:50]})
