from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from .models import Offer, FavoriteOffer, Location, OfferType, DurationOption, Application, Interview, Message
from apps.specialities.models import Domain, Skill
from .serializers import (
    OfferSerializer, OfferStatusUpdateSerializer, 
    ApplicationSerializer, ApplicationNotesSerializer, 
    InterviewSerializer, MessageSerializer, ApplicationEventSerializer
)
from apps.api.permissions import IsCompany, IsStudent, IsOwnerOrAdmin
from apps.matching.services import MatchingService
from .models import OfferEvent, OfferView, OfferReport, ApplicationEvent
from .utils import log_offer_event

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        sender_id = request.data.get('sender_id')
        if not sender_id:
            return Response({'error': 'sender_id is required'}, status=400)
        
        updated = Message.objects.filter(
            receiver=request.user, 
            sender_id=sender_id, 
            is_read=False
        ).update(is_read=True)
        
        return Response({'marked_read': updated})

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'company' and hasattr(user, 'company_profile'):
            return Interview.objects.filter(company=user.company_profile)
        elif user.role == 'student' and hasattr(user, 'student_profile'):
            return Interview.objects.filter(student=user.student_profile)
        return Interview.objects.none()

    def perform_create(self, serializer):
        application = serializer.validated_data['application']
        serializer.save(
            company=application.company,
            student=application.student
        )
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_interview_proposed(serializer.instance)

class OfferListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsCompany()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        user = request.user
        sort = request.query_params.get('sort', 'created_at')
        
        # 0. Cleanup expired boosts
        Offer.objects.filter(is_featured=True, boosted_until__lt=timezone.now()).update(is_featured=False)
        
        qs = Offer.objects.all().order_by('-is_featured', '-created_at')

        if user.role == 'student':
            qs = qs.filter(status='active', is_flagged=False)
            
            domains = request.query_params.get('domain') 
            locations = request.query_params.get('location')
            types = request.query_params.get('type')
            durations = request.query_params.get('duration')

            if domains:
                domain_list = domains.split(',')
                ids = [d for d in domain_list if d.isdigit()]
                names = [d for d in domain_list if not d.isdigit()]
                
                query = Q()
                if ids: query |= Q(domains__id__in=ids)
                if names: query |= Q(domains__name__in=names)
                qs = qs.filter(query)
            
            if locations:
                loc_list = locations.split(',')
                ids = [l for l in loc_list if l.isdigit()]
                names = [l for l in loc_list if not l.isdigit()]
                
                query = Q()
                if ids: query |= Q(locations__id__in=ids)
                if names: 
                    query |= Q(locations__name__icontains=names[0]) | Q(wilaya__icontains=names[0])
                qs = qs.filter(query)
            
            if types:
                type_list = types.split(',')
                ids = [t for t in type_list if t.isdigit()]
                names = [t for t in type_list if not t.isdigit()]
                
                query = Q()
                if ids: query |= Q(offer_types__id__in=ids)
                if names: query |= Q(offer_types__name__in=names)
                qs = qs.filter(query)
            
            if durations:
                dur_list = durations.split(',')
                qs = qs.filter(durations__months__in=dur_list)

            qs = qs.distinct()

        elif user.role == 'company':
            qs = qs.filter(company=user.company_profile)
        
        # Sort
        serializer = OfferSerializer(qs, many=True, context={'request': request})
        data = serializer.data
   
        if sort == 'match':
            data = sorted(data, key=lambda x: x.get('match_score', 0), reverse=True)
            
        return Response(data)

    def post(self, request):
        serializer = OfferSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            offer = serializer.save(company=request.user.company_profile)
            log_offer_event(offer, 'created', 'The offer has been published.')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfferDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        
        # Log view and increment counter if student
        if request.user.role == 'student' and hasattr(request.user, 'student_profile'):
            # 1. Timeline (First View only)
            log_offer_event(offer, 'first_view', 'First consultation by a student.')
            
            # 2. Analytics (Every unique view session)
            from django.db import models
            offer.views_count = models.F('views_count') + 1
            offer.save(update_fields=['views_count'])
            
            OfferView.objects.create(offer=offer, student=request.user.student_profile)
            
        serializer = OfferSerializer(offer, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        # permissions: Only owner (Company) or Admin
        if request.user.role != 'admin' and offer.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = OfferSerializer(offer, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        # permissions: Only owner (Company) or Admin
        if request.user.role != 'admin' and offer.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        offer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ToggleFavoriteView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, offer_id): 
        offer = get_object_or_404(Offer, id=offer_id)
        favorite, created = FavoriteOffer.objects.get_or_create(user=request.user, offer=offer)
        
        if not created:
            favorite.delete()
            return Response({'is_favorite': False})
        return Response({'is_favorite': True}, status=status.HTTP_201_CREATED)

class FavoriteOffersListView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        favorite_offers = Offer.objects.filter(favorited_by__user=request.user).order_by('-favorited_by__created_at')
        serializer = OfferSerializer(favorite_offers, many=True, context={'request': request})
        return Response(serializer.data)

class OfferStatusUpdateView(APIView):
    permission_classes = [IsOwnerOrAdmin]

    def patch(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        serializer = OfferStatusUpdateSerializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfferMineListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'company':
            qs = Offer.objects.filter(company=user.company_profile)
        elif user.role == 'student':
            qs = Offer.objects.filter(favorited_by__user=user)
        else: 
            qs = Offer.objects.all()
            
        serializer = OfferSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

class OfferMetadataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .serializers import DomainSerializer, LocationSerializer, OfferTypeSerializer, DurationOptionSerializer, SkillSerializer
        from .models import Location, OfferType, DurationOption
        from apps.specialities.models import Domain, Skill
        
        data = {
            "domains": DomainSerializer(Domain.objects.all(), many=True).data,
            "locations": LocationSerializer(Location.objects.all(), many=True).data,
            "offer_types": OfferTypeSerializer(OfferType.objects.all(), many=True).data,
            "durations": DurationOptionSerializer(DurationOption.objects.all().order_by('months'), many=True).data,
            "skills": SkillSerializer(Skill.objects.all(), many=True).data,
        }
        return Response(data)

class CompanyDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can access this dashboard.'}, status=status.HTTP_403_FORBIDDEN)
            
        company_profile = request.user.company_profile
        offers = Offer.objects.filter(company=company_profile)
        total_offers = offers.count()
        active_offers = offers.filter(status='active').count()
        
        from .models import Application
        applications = Application.objects.filter(company=company_profile)
        total_applications = applications.count()
        pending_applications = applications.filter(status='pending').count()
        accepted_applications = applications.filter(status='accepted').count()
        
        recent_apps = applications.order_by('-created_at')[:5]
        recent_applications = ApplicationSerializer(recent_apps, many=True, context={'request': request}).data
        
        recent_offers_qs = offers.order_by('-created_at')[:5]
        recent_offers = OfferSerializer(recent_offers_qs, many=True, context={'request': request}).data

        return Response({
            "stats": {
                "active_offers": active_offers,
                "total_applications": total_applications,
                "pending_review": pending_applications,
                "accepted_applications": accepted_applications,
                "interviews_scheduled": 0,
                "unread_messages": 0,
                "new_applications_today": applications.filter(created_at__date=timezone.now().date()).count()
            },
            "recent_offers": recent_offers,
            "recent_applications": recent_applications
        })

class CompanyOfferStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk, company=request.user.company_profile)
        applications = Application.objects.filter(offer=offer)
        
        return Response({
            "offer": {
                "id": offer.id,
                "title": offer.title,
                "status": offer.status,
                "created_at": offer.created_at,
                "deadline": offer.deadline
            },
            "applications": {
                "total": applications.count(),
                "pending": applications.filter(status='pending').count(),
                "accepted": applications.filter(status='accepted').count(),
                "refused": applications.filter(status='rejected').count(),
            }
        })

class CompanyOfferDuplicateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk, company=request.user.company_profile)
        new_title = request.data.get('new_title', f"{offer.title} (Copy)")
        
        offer.pk = None
        offer.title = new_title
        offer.status = 'draft' # Or whatever default
        if 'modify_fields' in request.data:
            for field, value in request.data['modify_fields'].items():
                setattr(offer, field, value)
        offer.save()
        return Response({
            "message": "Offer duplicated successfully",
            "new_offer_id": offer.pk,
            "new_offer_title": offer.title
        }, status=status.HTTP_201_CREATED)

class CompanyOfferExtendDeadlineView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk, company=request.user.company_profile)
        new_deadline = request.data.get('new_deadline')
        
        if not new_deadline:
            return Response({"error": "new_deadline is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        old_deadline = offer.deadline
        offer.deadline = new_deadline
        offer.save()
        
        return Response({
            "message": "Deadline extended",
            "old_deadline": old_deadline,
            "new_deadline": offer.deadline
        })

class CompanyOfferApplicantsSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCompany]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk, company=request.user.company_profile)
        applications = Application.objects.filter(offer=offer)
        
        return Response({
            "total_applicants": applications.count(),
            "by_status": {
                "pending": applications.filter(status='pending').count(),
                "accepted": applications.filter(status='accepted').count(),
                "refused": applications.filter(status='rejected').count()
            }
        })

class PublicPlatformStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Count
        
        # Total active offers
        active_offers = Offer.objects.filter(status='active').count()
        
        # Total companies with at least one active offer
        companies_with_offers = Offer.objects.filter(
            status='active'
        ).values('company').distinct().count()
        
        # Success rate: accepted / total applications * 100
        all_applications = Application.objects.all()
        total_apps = all_applications.count()
        accepted_apps = all_applications.filter(status='accepted').count()
        success_rate = round((accepted_apps / total_apps * 100), 1) if total_apps > 0 else 0
        
        return Response({
            'active_offers': active_offers,
            'companies_with_offers': companies_with_offers,
            'success_rate': success_rate,
            'total_applications': total_apps,
            'accepted_applications': accepted_apps,
        })

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from .models import Application
from .serializers import ApplicationSerializer, ApplicationNotesSerializer

class ApplicationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ApplicationPagination

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student' and hasattr(user, 'student_profile'):
            return Application.objects.filter(student=user.student_profile)
        elif user.role == 'company' and hasattr(user, 'company_profile'):
            return Application.objects.filter(company=user.company_profile)
        elif user.role == 'admin':
            return Application.objects.all()
        return Application.objects.none()

    def create(self, request, *args, **kwargs):
        # Student applies to an offer.
        # Validates: user is a student, offer exists and is active, not already applied.
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can apply.'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = request.user.student_profile
        offer_id = request.data.get('offer')

        if not offer_id:
            return Response({'error': 'offer is required'}, status=status.HTTP_400_BAD_REQUEST)

        offer = get_object_or_404(Offer, id=offer_id)

        if offer.status != 'active':
            return Response({'error': 'Cannot apply to an inactive offer.'}, status=status.HTTP_400_BAD_REQUEST)

        if Application.objects.filter(student=student_profile, offer=offer).exists():
            return Response({'error': 'You have already applied to this offer.'}, status=status.HTTP_400_BAD_REQUEST)

        # Inject student into request data
        mutable_data = request.data.copy()
        mutable_data['student'] = student_profile.id
        request._full_data = mutable_data
        response = super().create(request, *args, **kwargs)
        
        # Log Events
        log_offer_event(offer, 'first_app', f'First application received from {request.user.get_full_name()}.')
        
        count = Application.objects.filter(offer=offer).count()
        if count in [10, 50, 100]:
            log_offer_event(offer, 'milestone', f'Congratulations! You have reached {count} applications.', {'count': count})
            
        return response

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        sort = request.query_params.get('sort')
        if sort == 'match':
            data = sorted(data, key=lambda x: x.get('match_score', 0), reverse=True)

        return Response(data)

    def perform_create(self, serializer):
        application = serializer.save(student=self.request.user.student_profile)

        from apps.notifications.services import NotificationService
        NotificationService.notify_application_submitted(application)

    # ─────────────────────────────────────────
    # STUDENT ACTIONS
    # ─────────────────────────────────────────

    @action(detail=False, methods=['get'])
    def mine(self, request):
        """
        GET /api/applications/mine/
        Student: list all personal applications, optionally filtered by ?status=
        """
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        queryset = queryset.order_by('-created_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        GET /api/applications/pending/
        Student: list only applications with status='pending'.
        Shows everything the student has submitted but the company hasn't yet reviewed.
        """
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(status='pending').order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def accepted(self, request):
        """
        GET /api/applications/accepted/
        Student: list only applications with status='accepted'.
        Shows internship offers the company accepted. Students can then generate a convention.
        """
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(status='accepted').order_by('-updated_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def refused(self, request):
        """
        GET /api/applications/refused/
        Student: list only applications with status='rejected'.
        Shows applications the company declined.
        """
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().filter(status='rejected').order_by('-updated_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='withdraw')
    def withdraw(self, request, pk=None):
        """
        DELETE /api/applications/<pk>/withdraw/
        Student: permanently withdraw (delete) a pending application.
        Only works if status is 'pending' — cannot withdraw an accepted/refused application.
        """
        application = self.get_object()

        if request.user.role != 'student' or application.student != request.user.student_profile:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'pending':
            return Response({'error': 'Only pending applications can be withdrawn.'}, status=status.HTTP_400_BAD_REQUEST)

        application.delete()
        return Response({'message': 'Application withdrawn successfully.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """
        PATCH /api/applications/<pk>/cancel/  (legacy alias for withdraw)
        Student: cancel a pending application.
        """
        application = self.get_object()

        if request.user.role != 'student' or application.student != request.user.student_profile:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if application.status != 'pending':
            return Response({'error': 'Only pending applications can be cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

        application.delete()
        return Response({'message': 'Application cancelled successfully.'}, status=status.HTTP_200_OK)

    # ─────────────────────────────────────────
    # COMPANY ACTIONS
    # ─────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='company/list')
    def company_list(self, request):
        """
        GET /api/applications/company/list/
        Company: list all applications received for all their offers.
        Supports ?offer_id= filter to narrow by a specific offer.
        """
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = self.get_queryset().order_by('-created_at')

        offer_id = request.query_params.get('offer_id')
        if offer_id:
            queryset = queryset.filter(offer_id=offer_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='company/detail')
    def company_detail(self, request, pk=None):
        """
        GET /api/applications/<pk>/company/detail/
        Company: retrieve full details of one specific application.
        Includes student name, match score, cover letter, and company notes.
        """
        application = self.get_object()

        if request.user.role != 'company' or application.company != request.user.company_profile:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(application)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def notes(self, request, pk=None):
        """
        PATCH /api/applications/<pk>/notes/
        Company: add or update internal private notes on an application.
        Notes are NOT visible to the student — internal company use only.
        """
        application = self.get_object()

        if request.user.role != 'company' or application.company != request.user.company_profile:
            return Response({'error': 'Only the owning company can update notes.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ApplicationNotesSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Notes updated.', 'company_notes': serializer.data['company_notes']})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        POST /api/applications/<pk>/accept/
        Company: mark an application as accepted.
        Sends a notification to the student automatically.
        """
        application = self.get_object()

        if request.user.role != 'company' or application.company != request.user.company_profile:
            return Response({'error': 'Only the owning company can accept applications.'}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'accepted'
        application.save()

        log_application_event(application, 'accepted', 'Your application has been accepted by the company.')

        from apps.notifications.services import NotificationService
        NotificationService.notify_application_accepted(application)

        return Response({'message': 'Application accepted'})

    @action(detail=True, methods=['post'])
    def refuse(self, request, pk=None):
        """
        POST /api/applications/<pk>/refuse/
        Company: mark an application as rejected.
        Sends a notification to the student automatically.
        """
        application = self.get_object()

        if request.user.role != 'company' or application.company != request.user.company_profile:
            return Response({'error': 'Only the owning company can refuse applications.'}, status=status.HTTP_403_FORBIDDEN)

        application.status = 'rejected'
        application.save()

        log_application_event(application, 'refused', 'Your application has been declined by the company.')

        from apps.notifications.services import NotificationService
        NotificationService.notify_application_refused(application)

        return Response({'message': 'Application refused'})

    @action(detail=False, methods=['get'], url_path=r'offer/(?P<offer_id>\d+)')
    def offer_applicants(self, request, offer_id=None):
        """
        GET /api/applications/offer/<offer_id>/
        Company: get all applicants for one specific offer.
        """
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        offer = get_object_or_404(Offer, id=offer_id)

        if offer.company != request.user.company_profile:
            return Response({'error': 'You do not have permission to view this offer.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Application.objects.filter(offer=offer).order_by('-created_at')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """
        POST /api/applications/<pk>/view/
        Company: mark an application as viewed. Triggers a notification to the student.
        Auto-timestamps the first time a company opens the application.
        """
        from django.utils import timezone
        application = self.get_object()

        if not hasattr(application, 'viewed_at') or not getattr(application, 'viewed_at'):
            if hasattr(application, 'viewed_at'):
                application.viewed_at = timezone.now()
            application.save()

            from apps.notifications.services import NotificationService
            NotificationService.notify_application_viewed(application)

        return Response({'message': 'Application marked as viewed'})

    @action(detail=True, methods=['post'], url_path='generate-convention')
    def generate_convention(self, request, pk=None):
        """
        POST /api/applications/<pk>/generate-convention/
        Company: generate an internship convention PDF for an accepted application.
        Fails if application is not accepted, or if a convention already exists.
        """
        application = self.get_object()

        if application.status != 'accepted':
            return Response({'error': 'Application must be accepted first'}, status=status.HTTP_400_BAD_REQUEST)

        if hasattr(application, 'convention') and application.convention is not None:
            return Response({'error': 'Convention already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user != application.offer.company.user:
            return Response({'error': 'Only the company can generate convention'}, status=status.HTTP_403_FORBIDDEN)

        from apps.conventions.services.convention_service import ConventionService
        from apps.conventions.serializers import ConventionSerializer

        convention = ConventionService.generate_convention(application)

        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_generated(convention)

        serializer = ConventionSerializer(convention)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ─────────────────────────────────────────
    # ADMIN ACTIONS
    # ─────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='admin/list')
    def admin_list(self, request):
        """
        GET /api/applications/admin/list/
        Admin: see ALL applications across every student and company in the platform.
        Supports ?status= and ?offer_id= filters.
        """
        if request.user.role != 'admin':
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        queryset = Application.objects.all().order_by('-created_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        offer_id = request.query_params.get('offer_id')
        if offer_id:
            queryset = queryset.filter(offer_id=offer_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='admin/stats')
    def admin_stats(self, request):
        """
        GET /api/applications/admin/stats/
        Admin: global application statistics across the entire platform.
        Returns total, pending, accepted, refused counts, and acceptance rate.
        """
        if request.user.role != 'admin':
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models import Count
        all_apps = Application.objects.all()
        total    = all_apps.count()
        pending  = all_apps.filter(status='pending').count()
        accepted = all_apps.filter(status='accepted').count()
        refused  = all_apps.filter(status='rejected').count()

        # Top offers by number of applications
        top_offers = (
            Application.objects
            .values('offer__id', 'offer__title', 'offer__company__company_name')
            .annotate(application_count=Count('id'))
            .order_by('-application_count')[:5]
        )

        return Response({
            'total':           total,
            'pending':         pending,
            'accepted':        accepted,
            'refused':         refused,
            'acceptance_rate': round(accepted / total * 100, 1) if total > 0 else 0.0,
            'top_offers':      list(top_offers),
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        GET /api/applications/stats/
        Student: personal application statistics — total, pending, accepted, refused,
        acceptance rate, and average match score.
        """
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({'error': 'Only students can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models import Avg
        apps = Application.objects.filter(student=request.user.student_profile)
        total    = apps.count()
        pending  = apps.filter(status='pending').count()
        accepted = apps.filter(status='accepted').count()
        refused  = apps.filter(status='rejected').count()

        return Response({
            'total':            total,
            'pending':          pending,
            'accepted':         accepted,
            'refused':          refused,
            'acceptance_rate':  round(accepted / total * 100, 1) if total > 0 else 0.0,
        })

    @action(detail=False, methods=['post'], url_path='bulk-action')
    def bulk_action(self, request):
        """
        POST /api/applications/bulk-action/
        Company: accept or refuse multiple applications in one request.
        Body: { "application_ids": [1,2,3], "action": "refuse", "reason": "..." }
        """
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can perform bulk actions.'}, status=status.HTTP_403_FORBIDDEN)

        ids    = request.data.get('application_ids', [])
        action = request.data.get('action')
        reason = request.data.get('reason', '')

        if action not in ['accept', 'refuse']:
            return Response({'error': "action must be 'accept' or 'refuse'"}, status=status.HTTP_400_BAD_REQUEST)

        apps = Application.objects.filter(
            id__in=ids,
            company=request.user.company_profile
        )

        new_status = 'accepted' if action == 'accept' else 'rejected'
        updated    = apps.update(status=new_status)

        return Response({
            'updated': updated,
            'action':  action,
            'status':  new_status,
        })

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """
        GET /api/applications/analytics/
        Company: full recruitment funnel and per-offer breakdown.
        """
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models import Count, Avg
        from django.db.models.functions import TruncMonth

        company = request.user.company_profile
        apps = Application.objects.filter(company=company)

        # 1. Per-offer breakdown
        by_offer = (
            apps.values('offer__id', 'offer__title')
            .annotate(
                applications=Count('id'),
                accepted_count=Count('id', filter=Q(status='accepted')),
            )
        )
        by_offer_result = []
        for row in by_offer:
            total = row['applications']
            accepted = row['accepted_count']
            by_offer_result.append({
                'offer_id':        row['offer__id'],
                'offer_title':     row['offer__title'],
                'applications':    total,
                'acceptance_rate': round(accepted / total * 100, 1) if total > 0 else 0.0,
            })

        return Response({'by_offer': by_offer_result})

    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        GET /api/applications/export/?offer_id=23&status=all&format=csv
        Company: export their applications to CSV or Excel.
        """
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({'error': 'Only companies can export applications.'}, status=status.HTTP_403_FORBIDDEN)

        import csv
        from django.http import HttpResponse

        company = request.user.company_profile
        apps = Application.objects.filter(company=company).select_related(
            'student__user', 'offer'
        )

        # Filters
        offer_id = request.query_params.get('offer_id')
        status_filter = request.query_params.get('status')
        if offer_id:
            apps = apps.filter(offer_id=offer_id)
        if status_filter and status_filter != 'all':
            apps = apps.filter(status=status_filter)

        export_format = request.query_params.get('format', 'csv')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="applications_export.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Student Name', 'Email', 'Offer', 'Status', 'Applied At'])

        for app in apps:
            writer.writerow([
                app.id,
                app.student.user.get_full_name(),
                app.student.user.email,
                app.offer.title,
                app.status,
                app.created_at.strftime('%Y-%m-%d'),
            ])

        return response


class OfferSearchView(APIView):
    """
    Advanced Offer Search with deep filtering and sorting
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 0. Cleanup expired boosts
        Offer.objects.filter(is_featured=True, boosted_until__lt=timezone.now()).update(is_featured=False)
        
        qs = Offer.objects.filter(status='active', is_flagged=False).order_by('-is_featured', '-created_at').distinct()
        
        # 1. Text Query
        query = request.query_params.get('query')
        if query:
            qs = qs.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(company__company_name__icontains=query)
            )

        # 2. Category Filters
        domain = request.query_params.get('domain')
        if domain:
            qs = qs.filter(domains__name__iexact=domain)
            
        location = request.query_params.get('location')
        if location:
            qs = qs.filter(Q(wilaya__icontains=location) | Q(locations__name__icontains=location))

        # 3. Attributes
        remote = request.query_params.get('remote')
        if remote:
            qs = qs.filter(offer_types__name__iexact='Remote')
            
        compensation = request.query_params.get('compensation')
        if compensation == 'true':
            qs = qs.filter(is_paid=True)

        # 4. Duration
        dur_min = request.query_params.get('duration_min')
        dur_max = request.query_params.get('duration_max')
        if dur_min:
            qs = qs.filter(durations__months__gte=dur_min)
        if dur_max:
            qs = qs.filter(durations__months__lte=dur_max)

        # 5. Skills
        skills = request.query_params.get('skills')
        if skills:
            skill_list = skills.split(',')
            qs = qs.filter(skills__name__in=skill_list)

        # Sorting
        sort_by = request.query_params.get('sort_by', 'created_at')
        if sort_by == 'deadline':
            qs = qs.order_by('deadline')
        elif sort_by == 'created_at':
            qs = qs.order_by('-created_at')
        
        serializer = OfferSerializer(qs, many=True, context={'request': request})
        data = serializer.data

        # Custom Sorting for Match Score
        if sort_by == 'match_score' and request.user.role == 'student':
            data = sorted(data, key=lambda x: x.get('match_score', 0), reverse=True)

        return Response({'count': len(data), 'results': data})

class OfferRecommendedView(APIView):
    """
    Personalized recommendations for the logged-in student
    """
    permission_classes = [IsStudent]

    def get(self, request):
        # We use the pre-calculated match scores if they exist
        from apps.matching.models import MatchScore
        
        student = request.user.student_profile
        recommendations = MatchScore.objects.filter(
            student=student, 
            offer__status='active'
        ).select_related('offer', 'offer__company').order_by('-total_score')[:15]

        # If no scores exist, return the 15 most recent active offers
        if not recommendations.exists():
            recent = Offer.objects.filter(status='active').order_by('-created_at')[:15]
            serializer = OfferSerializer(recent, many=True, context={'request': request})
            return Response({'personalized_recommendations': [{'offer': o} for o in serializer.data]})

        results = []
        for ms in recommendations:
            offer_data = OfferSerializer(ms.offer, context={'request': request}).data
            results.append({
                'offer': offer_data,
                'match_score': ms.total_score,
                'match_reasons': self._generate_reasons(ms.breakdown)
            })
            
        return Response({'personalized_recommendations': results})

    def _generate_reasons(self, breakdown):
        reasons = []
        if breakdown.get('skills', 0) > 70:
            reasons.append("Excellent skill match")
        if breakdown.get('speciality', 0) > 50:
            reasons.append("Matches your field of study")
        if breakdown.get('location', 0) == 100:
            reasons.append("Close to your location")
        return reasons

class OfferSimilarView(APIView):
    """
    Offers similar to a specific one
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        base_offer = get_object_or_404(Offer, pk=pk)
        
        # Criteria: same domains or same company, excluding itself
        similar = Offer.objects.filter(status='active').filter(
            Q(domains__in=base_offer.domains.all()) |
            Q(company=base_offer.company)
        ).exclude(id=base_offer.id).distinct()[:5]
        
        serializer = OfferSerializer(similar, many=True, context={'request': request})
        return Response({'similar_offers': serializer.data})

class OfferTrendingView(APIView):
    """
    Popular offers based on application count
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Trending = Active offers with most applications
        trending = Offer.objects.filter(status='active')\
            .annotate(app_count=Count('applications'))\
            .order_by('-app_count')[:10]
            
        serializer = OfferSerializer(trending, many=True, context={'request': request})
        results = []
        for i, o in enumerate(serializer.data):
            results.append({
                **o,
                'trending_score': 100 - (i * 5) # Placeholder score
            })
            
        return Response({'trending': results})


class OfferTimelineView(APIView):
    """
    Chronological activity log for an offer
    """
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        from .serializers import OfferEventSerializer
        events = offer.events.all()
        serializer = OfferEventSerializer(events, many=True)
        return Response({'timeline': serializer.data})


class OfferBoostView(APIView):
    """
    Boost an offer to the top of search results
    """
    permission_classes = [IsOwnerOrAdmin]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        duration_days = int(request.data.get('duration_days', 7))
        
        offer.is_featured = True
        offer.boosted_until = timezone.now() + timedelta(days=duration_days)
        offer.save()
        
        log_offer_event(
            offer, 
            'milestone', 
            f"The offer has been boosted for {duration_days} days!",
            {'duration': duration_days, 'expires_at': offer.boosted_until.isoformat()}
        )
        
        return Response({
            'status': 'boosted',
            'is_featured': offer.is_featured,
            'boosted_until': offer.boosted_until
        })


class OfferMatchPreviewView(APIView):
    """
    AI-driven simulator to predict how many students will match an offer
    """
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        from apps.accounts.models import Student
        from apps.accounts.serializers import StudentBrowseSerializer
        from apps.matching.services import MatchingService
        
        students = Student.objects.all()
        results = []
        
        # 1. Simulate matching for all students
        for student in students:
            try:
                score_data = MatchingService.calculate_match_score(student.id, offer.id)
                results.append({
                    'student': student,
                    'score': score_data.get('total_score', 0)
                })
            except: continue
            
        # 2. Categorize results
        high_matches = [r for r in results if r['score'] >= 75]
        good_matches = [r for r in results if 50 <= r['score'] < 75]
        
        # 3. Generate Top Samples
        results.sort(key=lambda x: x['score'], reverse=True)
        top_samples = results[:5]
        top_serializers = []
        for r in top_samples:
            s_data = StudentBrowseSerializer(r['student'], context={'request': request}).data
            s_data['predicted_match_score'] = r['score']
            top_serializers.append(s_data)
            
        # 4. AI Insights & Suggestions
        suggestions = []
        if len(high_matches) < 5:
            suggestions.append("Your offer is very restrictive. Try broadening the required skills.")
            
        # Skill-based suggestion (Check for common skills in the same domain)
        offer_skills = offer.skills.all()
        from apps.specialities.models import Skill
        common_skills = Skill.objects.filter(students__domain=offer.domains.first())\
            .annotate(count=Count('students'))\
            .order_by('-count')[:3]
            
        for skill in common_skills:
            if skill not in offer_skills:
                suggestions.append(f"Many students possess the '{skill.name}' skill. Adding it could increase your visibility.")
                break

        return Response({
            'simulation_summary': {
                'total_scanned_students': len(results),
                'high_potential_matches': len(high_matches),
                'good_matches': len(good_matches),
                'market_saturation': 'High' if len(high_matches) > 20 else 'Low'
            },
            'top_candidate_previews': top_serializers,
            'ai_recommendations': suggestions
        })


class OfferCloseView(APIView):
    """
    Close an offer (recruitment finished)
    """
    permission_classes = [IsOwnerOrAdmin]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        reason = request.data.get('reason', 'Recruitment finished')
        offer.status = 'closed'
        offer.save()
        
        log_offer_event(offer, 'status_change', f"Offer closed: {reason}")
        return Response({"message": "Offer closed successfully."})

class OfferReopenView(APIView):
    """
    Reopen a closed offer
    """
    permission_classes = [IsOwnerOrAdmin]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        new_deadline = request.data.get('new_deadline')
        if not new_deadline:
            return Response({"error": "new_deadline is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        offer.status = 'active'
        offer.deadline = new_deadline
        offer.save()
        
        log_offer_event(offer, 'status_change', "Offer reopened with a new deadline.")
        return Response({"message": "Offer reopened successfully."})

class OfferArchiveView(APIView):
    """
    Archive an offer (hidden from search)
    """
    permission_classes = [IsOwnerOrAdmin]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        offer.status = 'archived'
        offer.save()
        
        log_offer_event(offer, 'status_change', "Offer archived.")
        return Response({"message": "Offer archived successfully."})


def log_application_event(application, event_type, description, data=None):
    from .models import ApplicationEvent
    return ApplicationEvent.objects.create(
        application=application,
        event_type=event_type,
        description=description,
        data=data
    )

class ApplicationMineView(APIView):
    permission_classes = [IsStudent]
    def get(self, request):
        apps = Application.objects.filter(student=request.user.student_profile)
        serializer = ApplicationSerializer(apps, many=True, context={'request': request})
        return Response(serializer.data)

class ApplicationPendingView(APIView):
    permission_classes = [IsStudent]
    def get(self, request):
        apps = Application.objects.filter(student=request.user.student_profile, status='pending')
        serializer = ApplicationSerializer(apps, many=True, context={'request': request})
        return Response(serializer.data)

class ApplicationAcceptedView(APIView):
    permission_classes = [IsStudent]
    def get(self, request):
        apps = Application.objects.filter(student=request.user.student_profile, status='accepted')
        serializer = ApplicationSerializer(apps, many=True, context={'request': request})
        return Response(serializer.data)

class ApplicationWithdrawView(APIView):
    permission_classes = [IsStudent]
    def post(self, request, pk):
        app = get_object_or_404(Application, pk=pk, student=request.user.student_profile)
        reason = request.data.get('reason', 'Student withdrew application')
        app.status = 'withdrawn'
        app.save()
        log_application_event(app, 'withdrawn', f"Application withdrawn by student: {reason}")
        return Response({"message": "Application withdrawn successfully."})

class ApplicationTimelineView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        app = get_object_or_404(Application, pk=pk)
        # Permission: Only Student or Company or Admin
        if request.user.role == 'student' and app.student.user != request.user:
            return Response(status=403)
        if request.user.role == 'company' and app.company.user != request.user:
            return Response(status=403)
            
        events = app.timeline.all()
        serializer = ApplicationEventSerializer(events, many=True)
        return Response(serializer.data)


class OfferReportView(APIView):
    """
    Allow students to report inappropriate offers
    """
    permission_classes = [IsStudent]

    def post(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        from .serializers import OfferReportSerializer
        
        serializer = OfferReportSerializer(data=request.data)
        if serializer.is_valid():
            if OfferReport.objects.filter(offer=offer, reporter=request.user).exists():
                return Response({"error": "You have already reported this offer."}, status=status.HTTP_400_BAD_REQUEST)
                
            serializer.save(offer=offer, reporter=request.user)
            
            # Increment report count and check threshold
            offer.report_count += 1
            if offer.report_count >= 3:
                offer.is_flagged = True
                log_offer_event(offer, 'status_change', 'Offer automatically flagged due to multiple student reports.')
            
            offer.save()
            return Response({"message": "Report submitted successfully. Thank you for keeping the platform safe."}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminFlaggedOfferView(APIView):
    """
    List of offers that have been flagged by students (Admin only)
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        flagged = Offer.objects.filter(is_flagged=True).order_by('-report_count')
        serializer = OfferSerializer(flagged, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk):
        # Action to 'Clear' or 'Confirm' flag
        offer = get_object_or_404(Offer, pk=pk)
        action = request.data.get('action') # 'clear' or 'suspend'
        
        if action == 'clear':
            offer.is_flagged = False
            offer.report_count = 0
            OfferReport.objects.filter(offer=offer).delete()
            offer.save()
            log_offer_event(offer, 'status_change', 'Admin cleared all flags. Offer is now visible again.')
            return Response({"message": "Flags cleared. Offer is now live."})
            
        elif action == 'suspend':
            offer.status = 'closed'
            offer.save()
            log_offer_event(offer, 'status_change', 'Admin suspended this offer based on student reports.')
            return Response({"message": "Offer has been suspended."})
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)


class OfferAnalyticsView(APIView):
    """
    Detailed performance metrics for a specific offer
    """
    permission_classes = [IsOwnerOrAdmin]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        self.check_object_permissions(request, offer)
        
        from django.db.models import Count, Avg
        from django.utils import timezone
        from datetime import timedelta
        
        # 1. Performance Overview
        apps = Application.objects.filter(offer=offer)
        total_apps = apps.count()
        total_views = offer.views_count
        
        conversion_rate = (total_apps / total_views * 100) if total_views > 0 else 0
        
        # 2. Applicant Quality (Avg Match Score)
        from apps.matching.services import MatchingService
        avg_score = 0
        if total_apps > 0:
            scores = []
            for app in apps:
                try:
                    s = MatchingService.calculate_match_score(app.student.id, offer.id).get('total_score', 0)
                    scores.append(s)
                except: pass
            avg_score = sum(scores) / len(scores) if scores else 0

        # 3. Trends (Last 7 Days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        views_trend = OfferView.objects.filter(offer=offer, timestamp__gte=seven_days_ago)\
            .extra(select={'day': "date(timestamp)"})\
            .values('day')\
            .annotate(count=Count('id'))\
            .order_by('day')
            
        apps_trend = apps.filter(created_at__gte=seven_days_ago)\
            .extra(select={'day': "date(created_at)"})\
            .values('day')\
            .annotate(count=Count('id'))\
            .order_by('day')

        return Response({
            'performance': {
                'total_views': total_views,
                'total_applications': total_apps,
                'conversion_rate': round(conversion_rate, 1),
                'avg_applicant_match_score': round(avg_score, 1)
            },
            'trends': {
                'views_by_day': list(views_trend),
                'applications_by_day': list(apps_trend)
            }
        })

