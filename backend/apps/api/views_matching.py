from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.matching.services import MatchingService

class MatchingView(APIView):
    """
    Endpoint to get the detailed matching score between a student and an offer.
    GET /api/matching/?student_id=X&offer_id=Y
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        student_id = request.query_params.get('student_id')
        offer_id = request.query_params.get('offer_id')

        if not student_id or not offer_id:
            return Response(
                {"error": "Both student_id and offer_id are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = MatchingService.calculate_match_score(student_id, offer_id)
            return Response(result)
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

from rest_framework import serializers
from apps.matching.models import MatchScore
from apps.offers.serializers import OfferSerializer
from apps.accounts.serializers import StudentBrowseSerializer

class MatchScoreOfferSerializer(serializers.ModelSerializer):
    offer = OfferSerializer(read_only=True)
    class Meta:
        model = MatchScore
        fields = ['total_score', 'breakdown', 'updated_at', 'offer']

class MatchScoreStudentSerializer(serializers.ModelSerializer):
    student = StudentBrowseSerializer(read_only=True)
    class Meta:
        model = MatchScore
        fields = ['total_score', 'breakdown', 'updated_at', 'student']

class StudentMatchScoresView(APIView):
    """ GET /api/matching/my-scores/ """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student' or not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)
        
        scores = MatchScore.objects.filter(student=request.user.student_profile).order_by('-total_score')
        serializer = MatchScoreOfferSerializer(scores, many=True, context={'request': request})
        return Response(serializer.data)

class OfferMatchScoresView(APIView):
    """ GET /api/matching/offer/<id>/scores/ """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, offer_id):
        if request.user.role != 'company' or not hasattr(request.user, 'company_profile'):
            return Response({"error": "Only companies can access this endpoint."}, status=status.HTTP_403_FORBIDDEN)
            
        from apps.offers.models import Offer
        from django.shortcuts import get_object_or_404
        offer = get_object_or_404(Offer, id=offer_id)
        
        if offer.company != request.user.company_profile:
            return Response({"error": "You do not have permission to view this offer."}, status=status.HTTP_403_FORBIDDEN)
            
        scores = MatchScore.objects.filter(offer=offer).order_by('-total_score')
        serializer = MatchScoreStudentSerializer(scores, many=True, context={'request': request})
        return Response(serializer.data)

class RecalculateMatchesView(APIView):
    """ POST /api/matching/recalculate/ """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            MatchingService.recalculate_all_scores()
            return Response({"message": "Match scores recalculated successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
