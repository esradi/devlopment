from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.api.permissions import IsCompany
from .serializers import CompanyProfileSerializer, CompanyUpdateSerializer, CompanyLogoSerializer
from django.shortcuts import get_object_or_404

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
            # Return full profile after update
            updated_serializer = CompanyProfileSerializer(company)
            return Response(updated_serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyLogoUploadView(APIView):
    permission_classes = [IsAuthenticated, IsCompany]

    def post(self, request):
        company = request.user.company_profile
        serializer = CompanyLogoSerializer(company, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Logo uploaded successfully",
                    "logo": company.logo.url if company.logo else None
                }, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
