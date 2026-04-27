from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Domain, Speciality, Skill, SkillQuiz, SkillQuizSubmission, PortfolioSubmission
from .serializers import (
    DomainSerializer,
    DomainDetailSerializer,
    SpecialitySerializer,
    SpecialityDetailSerializer,
    SkillSerializer,
    SkillQuizSerializer,
    SkillQuizSubmissionSerializer,
    PortfolioSubmissionSerializer
)
from apps.api.permissions import IsUniversityAdmin, IsStudent


class DomainListView(generics.ListAPIView):
    #GET returns all domains
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [permissions.AllowAny]


class SpecialityListView(generics.ListAPIView):
    #GET returns all specialities
    serializer_class = SpecialitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Speciality.objects.all()
        domain = self.request.query_params.get('domain')
        if domain:
            qs = qs.filter(domain__id=domain)
        return qs


class SkillListView(generics.ListAPIView):
    #GET returns all skills (with optional filters)
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Skill.objects.all()
        speciality = self.request.query_params.get('speciality')
        domain = self.request.query_params.get('domain')
        if speciality:
            qs = qs.filter(speciality__id=speciality)
        if domain:
            qs = qs.filter(speciality__domain__id=domain)
        return qs


class SpecialitiesByDomainView(APIView):
    #List specialities under a specific domain#
    permission_classes = [permissions.AllowAny]

    def get(self, request, domain_pk):
        domain = get_object_or_404(Domain, pk=domain_pk)
        specialities = domain.specialities.all()
        serializer = SpecialitySerializer(specialities, many=True)
        return Response(serializer.data)


class SkillsBySpecialityView(APIView):
    #List skills under a specific speciality#
    permission_classes = [permissions.AllowAny]

    def get(self, request, speciality_pk):
        speciality = get_object_or_404(Speciality, pk=speciality_pk)
        skills = speciality.skills.all()
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)


class VerifyQuizListView(APIView):
    #List all MCQ quizzes (non-CS). Shows status per student.#
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        quizzes = SkillQuiz.objects.exclude(skill__speciality__domain__name__icontains='Computer Science')
        serializer = SkillQuizSerializer(quizzes, many=True)
        
        data = serializer.data
        if hasattr(request.user, 'student_profile'):
            student = request.user.student_profile
            submissions = SkillQuizSubmission.objects.filter(student=student)
            
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

    def get(self, request, skill_id):
        quiz = get_object_or_404(SkillQuiz, skill__id=skill_id)
        serializer = SkillQuizSerializer(quiz)
        return Response(serializer.data)


class VerifyQuizSubmitView(APIView):
    #Submit quiz answers. Auto-graded.#
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, skill_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can submit quizzes."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        quiz = get_object_or_404(SkillQuiz, skill__id=skill_id)
        
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
        
        submission = SkillQuizSubmission.objects.create(
            student=student,
            quiz=quiz,
            answers=answers,
            score=score_percentage,
            passed=passed
        )

        if passed:
            from apps.accounts.models import StudentSkill
            student_skill, created = StudentSkill.objects.get_or_create(
                student=student,
                skill=quiz.skill
            )
            student_skill.is_verified = True
            student_skill.save()
        
        serializer = SkillQuizSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyPortfolioSubmitView(APIView):
    #POST /api/verify/portfolio/:skill_id/submit/ Submit a portfolio URL to verify a skill
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, skill_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can submit portfolios."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        skill = get_object_or_404(Skill, pk=skill_id)
        
        portfolio_url = request.data.get('portfolio_url')
        if not portfolio_url:
            return Response({"error": "portfolio_url is required."}, status=status.HTTP_400_BAD_REQUEST)
    
        existing = PortfolioSubmission.objects.filter(student=student, skill=skill).exclude(status='rejected').first()
        if existing:
            return Response({"error": f"You already have a {existing.status} submission for this skill."}, status=status.HTTP_400_BAD_REQUEST)

        submission = PortfolioSubmission.objects.create(
            student=student,
            skill=skill,
            portfolio_url=portfolio_url,
            status='pending'
        )
        
        serializer = PortfolioSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VerifyPortfolioStatusView(APIView):
    #GET /api/verify/portfolio/:skill_id/status/ Check the status of a portfolio submission for a skill
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, skill_id):
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can check portfolio status."}, status=status.HTTP_403_FORBIDDEN)
            
        student = request.user.student_profile
        skill = get_object_or_404(Skill, pk=skill_id)
        
        # Get the latest submission
        submission = PortfolioSubmission.objects.filter(student=student, skill=skill).order_by('-submitted_at').first()
        if not submission:
            return Response({"status": "unsubmitted"}, status=status.HTTP_200_OK)
            
        serializer = PortfolioSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AvailableSkillsView(APIView):
    #GET /api/skills/available/ — skills the student hasn't added yet
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = request.user.student_profile
        except Exception:
            return Response({"error": "Student profile not found"}, status=status.HTTP_404_NOT_FOUND)

        # IDs of skills the student already has
        existing_ids = student.skills.values_list('id', flat=True)

        # All skills not yet in the student's list
        qs = Skill.objects.exclude(id__in=existing_ids).select_related('speciality')

        # Optional filters
        speciality = request.query_params.get('speciality')
        domain = request.query_params.get('domain')
        if speciality:
            qs = qs.filter(speciality__id=speciality)
        if domain:
            qs = qs.filter(speciality__domain__id=domain)

        serializer = SkillSerializer(qs, many=True)
        return Response({"available_skills": serializer.data}, status=status.HTTP_200_OK)
