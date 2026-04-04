from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Domain, Speciality, Competency, CompetencyQuiz, QuizSubmission, PortfolioSubmission
from .serializers import (
    DomainSerializer,
    DomainDetailSerializer,
    SpecialitySerializer,
    SpecialityDetailSerializer,
    CompetencySerializer,
    CompetencyQuizSerializer,
    QuizSubmissionSerializer,
    PortfolioSubmissionSerializer
)
from apps.api.permissions import IsUniversityAdmin


class DomainListCreateView(APIView):
    #GET returns all domains; POST creates a domain (admin only)#
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
    #GET returns all specialities; POST creates a speciality (admin only)#
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
    #GET returns all competencies (with optional filters); POST creates competency (admin only)#
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
    #List specialities under a specific domain#
    permission_classes = [permissions.AllowAny]

    def get(self, request, domain_pk):
        domain = get_object_or_404(Domain, pk=domain_pk)
        specialities = domain.specialities.all()
        serializer = SpecialitySerializer(specialities, many=True)
        return Response(serializer.data)


class CompetenciesBySpecialityView(APIView):
    #List competencies under a specific speciality#
    permission_classes = [permissions.AllowAny]

    def get(self, request, speciality_pk):
        speciality = get_object_or_404(Speciality, pk=speciality_pk)
        comps = speciality.competencies.all()
        serializer = CompetencySerializer(comps, many=True)
        return Response(serializer.data)


class VerifyQuizListView(APIView):
    #List all MCQ quizzes (non-CS). Shows status per student.#
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        quizzes = CompetencyQuiz.objects.exclude(competency__speciality__domain__name__icontains='Computer Science')
        serializer = CompetencyQuizSerializer(quizzes, many=True)
        
        data = serializer.data
        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
            submissions = QuizSubmission.objects.filter(student=student)
            
            # Create a lookup for quizzes the student has taken
            # Format: { quiz_id: { "passed": True/False, "score": score } }
            submission_status = {
                sub.quiz.id: {
                    "passed": sub.passed,
                    "score": sub.score
                } for sub in submissions
            }

            for item in data:
                quiz_id = item['id']
                item['student_status'] = submission_status.get(quiz_id, None)

        return Response(data)


class VerifyQuizDetailView(APIView):
    #Get quiz questions#
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, competency_id):
        quiz = get_object_or_404(CompetencyQuiz, competency__id=competency_id)
        serializer = CompetencyQuizSerializer(quiz)
        return Response(serializer.data)


class VerifyQuizSubmitView(APIView):
    #Submit quiz answers. Auto-graded.#
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, competency_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can submit quizzes."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        quiz = get_object_or_404(CompetencyQuiz, competency__id=competency_id)
        
        # Expected format: { "question_id": "A" } or similar
        answers = request.data.get('answers', {})
        
        if not answers:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        correct_count = 0
        total_questions = quiz.questions.count()
        
        if total_questions == 0:
            return Response({"error": "This quiz has no questions."}, status=status.HTTP_400_BAD_REQUEST)

        for q in quiz.questions.all():
            student_answer = answers.get(str(q.id))
            if student_answer and student_answer.upper() == q.correct.upper():
                correct_count += 1
                
        score_percentage = (correct_count / total_questions) * 100
        passed = score_percentage >= 70
        
        submission = QuizSubmission.objects.create(
            student=student,
            quiz=quiz,
            answers=answers,
            score=score_percentage,
            passed=passed
        )
        
        serializer = QuizSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyPortfolioSubmitView(APIView):
    #POST /api/verify/portfolio/:competency_id/submit/ Submit a portfolio URL to verify a competency
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, competency_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can submit portfolios."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        competency = get_object_or_404(Competency, pk=competency_id)
        
        portfolio_url = request.data.get('portfolio_url')
        if not portfolio_url:
            return Response({"error": "portfolio_url is required."}, status=status.HTTP_400_BAD_REQUEST)
    
        existing = PortfolioSubmission.objects.filter(student=student, competency=competency).exclude(status='rejected').first()
        if existing:
            return Response({"error": f"You already have a {existing.status} submission for this competency."}, status=status.HTTP_400_BAD_REQUEST)

        submission = PortfolioSubmission.objects.create(
            student=student,
            competency=competency,
            portfolio_url=portfolio_url,
            status='pending'
        )
        
        serializer = PortfolioSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyPortfolioStatusView(APIView):
    #GET /api/verify/portfolio/:competency_id/status/ Check the status of a portfolio submission for a competency
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, competency_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can check portfolio status."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        competency = get_object_or_404(Competency, pk=competency_id)
        
        # Get the latest submission
        submission = PortfolioSubmission.objects.filter(student=student, competency=competency).order_by('-submitted_at').first()
        if not submission:
            return Response({"status": "unsubmitted"}, status=status.HTTP_200_OK)
            
        serializer = PortfolioSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)
