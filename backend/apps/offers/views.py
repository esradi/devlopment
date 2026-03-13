from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Offer, FavoriteOffer, Domain, Location, OfferType, DurationOption
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
            
            # Multi-select Filters
            domains = request.query_params.get('domain') # e.g. "1,2" or "CS,Biology"
            locations = request.query_params.get('location')
            types = request.query_params.get('type')
            durations = request.query_params.get('duration')

            if domains:
                domain_list = domains.split(',')
                # Separate numeric IDs from names to avoid ValueError
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
                    # Search in both Location model and wilaya field
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

            # Deduplicate because of M2M joins
            qs = qs.distinct()

        elif user.role == 'company':
            qs = qs.filter(company=user.company_profile)
        
        # Sort
        serializer = OfferSerializer(qs, many=True, context={'request': request})
        data = serializer.data
        
        # Sort by match_score if requested
        if sort == 'match':
            data = sorted(data, key=lambda x: x.get('match_score', 0), reverse=True)
            
        return Response(data)

    def post(self, request):
        serializer = OfferSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Automatically assign the company profile
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
        # Check permissions: Only owner (Company) or Admin
        if request.user.role != 'admin' and offer.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = OfferSerializer(offer, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        offer = get_object_or_404(Offer, pk=pk)
        # Check permissions: Only owner (Company) or Admin
        if request.user.role != 'admin' and offer.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        offer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ToggleFavoriteView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, offer_id): # Use offer_id as in urls.py
        offer = get_object_or_404(Offer, id=offer_id)
        favorite, created = FavoriteOffer.objects.get_or_create(user=request.user, offer=offer)
        
        if not created:
            favorite.delete()
            return Response({'is_favorite': False})
        return Response({'is_favorite': True}, status=status.HTTP_201_CREATED)

class FavoriteOffersListView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        # Return a list of Offer objects directly instead of FavoriteOffer wrappers
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
        else: # Admin
            qs = Offer.objects.all()
            
        serializer = OfferSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

class OfferMetadataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .serializers import DomainSerializer, LocationSerializer, OfferTypeSerializer, DurationOptionSerializer, SkillSerializer
        from .models import Domain, Location, OfferType, DurationOption, Skill
        
        data = {
            "domains": DomainSerializer(Domain.objects.all(), many=True).data,
            "locations": LocationSerializer(Location.objects.all(), many=True).data,
            "offer_types": OfferTypeSerializer(OfferType.objects.all(), many=True).data,
            "durations": DurationOptionSerializer(DurationOption.objects.all().order_by('months'), many=True).data,
            "skills": SkillSerializer(Skill.objects.all(), many=True).data,
        }
        return Response(data)

from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Application
from .serializers import ApplicationSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Student Applications.
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student' and hasattr(user, 'student_profile'):
            return Application.objects.filter(student=user.student_profile)
        elif user.role == 'company' and hasattr(user, 'company_profile'):
            return Application.objects.filter(company=user.company_profile)
        elif user.role == 'admin':
            return Application.objects.all()
        return Application.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Support sorting by match_score
        sort = request.query_params.get('sort')
        if sort == 'match':
            data = sorted(data, key=lambda x: x.get('match_score', 0), reverse=True)

        return Response(data)

    def perform_create(self, serializer):
        application = serializer.save(student=self.request.user.student_profile)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_application_submitted(application)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        application = self.get_object()
        application.status = 'accepted'
        application.save()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_application_accepted(application)
        
        return Response({'message': 'Application accepted'})
    
    @action(detail=True, methods=['post'])
    def refuse(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected' # Verify exact status name in your model, maybe 'refused'
        application.save()
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_application_refused(application)
        
        return Response({'message': 'Application refused'})
    
    @action(detail=True, methods=['post'])
    def view(self, request, pk=None):
        """Marquer comme vue par l'entreprise"""
        from django.utils import timezone
        application = self.get_object()
        
        if not hasattr(application, 'viewed_at') or not getattr(application, 'viewed_at'):
            if hasattr(application, 'viewed_at'):
                application.viewed_at = timezone.now()
            # If your model tracks viewed_at, save it here. Even if not, the notification is what matters most for the student.
            application.save()
            
            from apps.notifications.services import NotificationService
            NotificationService.notify_application_viewed(application)
        
        return Response({'message': 'Application marked as viewed'})

    @action(detail=True, methods=['post'], url_path='generate-convention')
    def generate_convention(self, request, pk=None):
        """
        POST /api/applications/<id>/generate-convention/
        
        Génère une convention après acceptation de la candidature.
        Permission: Company (owner de l'offre) uniquement.
        """
        application = self.get_object()
        
        # Verify status
        if application.status != 'accepted':
            return Response(
                {'error': 'Application must be accepted first'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify it doesn't already have one
        if hasattr(application, 'convention') and application.convention is not None:
            return Response(
                {'error': 'Convention already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify ownership
        if request.user != application.offer.company.user:
            return Response(
                {'error': 'Only the company can generate convention'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        from apps.conventions.services.convention_service import ConventionService
        from apps.conventions.serializers import ConventionSerializer
        
        # Generate convention
        convention = ConventionService.generate_convention(application)
        
        from apps.notifications.services import NotificationService
        NotificationService.notify_convention_generated(convention)
        
        serializer = ConventionSerializer(convention)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
