from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Offer, FavoriteOffer, Location, OfferType, DurationOption
from apps.specialities.models import Domain, Skill
from .serializers import OfferSerializer, OfferStatusUpdateSerializer
from apps.api.permissions import IsCompany, IsStudent, IsOwnerOrAdmin

class OfferListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsCompany()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        user = request.user
        sort = request.query_params.get('sort', 'created_at')
        qs = Offer.objects.all()

        if user.role == 'student':
            qs = qs.filter(status='active')
            
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
            serializer.save(company=request.user.company_profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OfferDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
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
    permission_classes = [IsAuthenticated, IsCompany]

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
    permission_classes = [IsAuthenticated, IsCompany]

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
    permission_classes = [IsAuthenticated, IsCompany]

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

        return super().create(request, *args, **kwargs)

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

