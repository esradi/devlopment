from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import ReferenceLetter
from .serializers import (
    ReferenceLetterCreateSerializer,
    ReferenceLetterDetailSerializer,
    ReferenceLetterSignSerializer,
    ReferenceLetterVerifySerializer
)
from utils.pdf_helpers import generate_reference_pdf


class ReferenceLetterListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReferenceLetterCreateSerializer
        return ReferenceLetterDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'company_profile'):
            return ReferenceLetter.objects.filter(generated_by=user)
        if hasattr(user, 'student_profile'):
            return ReferenceLetter.objects.filter(student__user=user)
        return ReferenceLetter.objects.none()

    def perform_create(self, serializer):
        letter = serializer.save(generated_by=self.request.user)
        generate_reference_pdf(letter, is_signed=False)


class ReferenceLetterDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReferenceLetterDetailSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'company_profile'):
            return ReferenceLetter.objects.filter(generated_by=user)
        if hasattr(user, 'student_profile'):
            return ReferenceLetter.objects.filter(student__user=user)
        return ReferenceLetter.objects.none()


class ReferenceLetterSignView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReferenceLetterSignSerializer
    queryset = ReferenceLetter.objects.all()

    def post(self, request, *args, **kwargs):
        letter = self.get_object()
        
        if letter.generated_by != request.user:
            return Response({"detail": "You do not have permission to sign this letter."}, status=status.HTTP_403_FORBIDDEN)
 
        generate_reference_pdf(letter, is_signed=True)
        
        return Response({
            "detail": "Reference letter successfully digitally signed.",
            "pdf_url": request.build_absolute_uri(letter.pdf_file.url)
        }, status=status.HTTP_200_OK)


class ReferenceLetterVerifyView(generics.RetrieveAPIView):
    """
    Public View to verify the authenticity of a document via its token.
    AllowAny because this link would be embedded on the PDF itself or scanned via QR.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = ReferenceLetterVerifySerializer
    queryset = ReferenceLetter.objects.all()
    lookup_field = 'verification_token'
    lookup_url_kwarg = 'token'
