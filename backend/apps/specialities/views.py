from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Domain, Speciality, Competency
from .serializers import (
    DomainSerializer,
    DomainDetailSerializer,
    SpecialitySerializer,
    SpecialityDetailSerializer,
    CompetencySerializer,
)
from apps.api.permissions import IsUniversityAdmin


class DomainListCreateView(APIView):
    """GET returns all domains; POST creates a domain (admin only)"""
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsUniversityAdmin()]
        return [permissions.AllowAny()]

    def get(self, request):
        domains = Domain.objects.all()
        serializer = DomainSerializer(domains, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DomainSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SpecialityListCreateView(APIView):
    """GET returns all specialities; POST creates a speciality (admin only)"""
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsUniversityAdmin()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = Speciality.objects.all()
        domain = request.query_params.get('domain')
        if domain:
            qs = qs.filter(domain__id=domain)
        serializer = SpecialitySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SpecialitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompetencyListCreateView(APIView):
    """GET returns all competencies (with optional filters); POST creates competency (admin only)"""
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsUniversityAdmin()]
        return [permissions.AllowAny()]

    def get(self, request):
        qs = Competency.objects.all()
        speciality = request.query_params.get('speciality')
        domain = request.query_params.get('domain')
        if speciality:
            qs = qs.filter(speciality__id=speciality)
        if domain:
            qs = qs.filter(speciality__domain__id=domain)
        serializer = CompetencySerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CompetencySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SpecialitiesByDomainView(APIView):
    """List specialities under a specific domain"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, domain_pk):
        domain = get_object_or_404(Domain, pk=domain_pk)
        specialities = domain.specialities.all()
        serializer = SpecialitySerializer(specialities, many=True)
        return Response(serializer.data)


class CompetenciesBySpecialityView(APIView):
    """List competencies under a specific speciality"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, speciality_pk):
        speciality = get_object_or_404(Speciality, pk=speciality_pk)
        comps = speciality.competencies.all()
        serializer = CompetencySerializer(comps, many=True)
        return Response(serializer.data)

