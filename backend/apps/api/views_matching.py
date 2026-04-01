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
