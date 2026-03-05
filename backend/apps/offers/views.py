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
        sort = request.query_params.get('sort', 'created_at')
        if sort == 'created_at':
            qs = qs.order_by('-created_at')
        else:
            # Basic validation to avoid crashes
            allowed_sorts = ['title', 'created_at']
            if sort in allowed_sorts:
                qs = qs.order_by(sort)
            else:
                qs = qs.order_by('-created_at')

        serializer = OfferSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

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
        favorites = FavoriteOffer.objects.filter(user=request.user).order_by('-created_at')
        from .serializers import FavoriteOfferSerializer
        serializer = FavoriteOfferSerializer(favorites, many=True, context={'request': request})
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
