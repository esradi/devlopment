from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.db.models import Q, Count, Avg
import os

from apps.accounts.models import Student, StudentSkill, StudentBadge
from apps.offers.models import Offer, Application
from apps.api.permissions import IsStudent
from .serializers import StudentProfileSerializer, StudentSkillSerializer

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS  (private functions used by the views below)
# ─────────────────────────────────────────────────────────────────────────────

def _get_average_match_score(student):
    """Compute average match score across up to 20 active offers."""
    try:
        from apps.matching.services import MatchingService
        active_offers = Offer.objects.filter(status='active')[:20]
        scores = []
        for offer in active_offers:
            try:
                result = MatchingService.calculate_match_score(student.id, offer.id)
                scores.append(result['total_score'])
            except Exception:
                pass
        return round(sum(scores) / len(scores), 1) if scores else 0
    except Exception:
        return 0


def _get_upcoming_interviews_count(student):
    """Count upcoming interviews for the student."""
    try:
        from apps.interviews.models import InterviewSlot
        from django.utils import timezone
        return InterviewSlot.objects.filter(
            student=student,
            scheduled_at__gte=timezone.now(),
            status='confirmed'
        ).count()
    except Exception:
        return 0


def _build_recent_activity(student):
    """Build a chronological activity feed from applications and challenge submissions."""
    activity = []

    # Recent applications
    apps = Application.objects.filter(student=student).order_by('-updated_at')[:5]
    for app in apps:
        if app.status == 'accepted':
            activity.append({
                'type':      'application_accepted',
                'message':   f"Your application to {app.offer.company.company_name} was accepted!",
                'timestamp': app.updated_at.isoformat(),
            })
        elif app.status == 'rejected':
            activity.append({
                'type':      'application_refused',
                'message':   f"Your application to {app.offer.company.company_name} was not retained.",
                'timestamp': app.updated_at.isoformat(),
            })
        else:
            activity.append({
                'type':      'application_submitted',
                'message':   f"You applied to {app.offer.title} at {app.offer.company.company_name}.",
                'timestamp': app.created_at.isoformat(),
            })

    # Recent challenge results
    try:
        from challenges.models import SkillChallengeSubmission
        subs = SkillChallengeSubmission.objects.filter(student=student).order_by('-submitted_at')[:3]
        for sub in subs:
            if sub.passed:
                activity.append({
                    'type':      'challenge_passed',
                    'message':   f"You passed the {sub.challenge.skill_name} challenge with {sub.score}%.",
                    'timestamp': sub.submitted_at.isoformat(),
                })
            else:
                activity.append({
                    'type':      'challenge_failed',
                    'message':   f"You scored {sub.score}% on the {sub.challenge.skill_name} challenge.",
                    'timestamp': sub.submitted_at.isoformat(),
                })
    except Exception:
        pass

    # Sort all by timestamp descending, return latest 8
    activity.sort(key=lambda x: x['timestamp'], reverse=True)
    return activity[:8]


def _get_recommended_offers(student, limit=3):
    """Return top N active offers not yet applied to, sorted by match score."""
    try:
        from apps.matching.services import MatchingService
        applied_offer_ids = set(
            Application.objects.filter(student=student).values_list('offer_id', flat=True)
        )
        active_offers = Offer.objects.filter(status='active').exclude(id__in=applied_offer_ids)
        scored = []
        for offer in active_offers[:30]:  # check up to 30, return top N
            try:
                result = MatchingService.calculate_match_score(student.id, offer.id)
                scored.append((result['total_score'], offer))
            except Exception:
                pass

        scored.sort(key=lambda x: x[0], reverse=True)

        result_list = []
        for score, offer in scored[:limit]:
            top_skills = list(offer.skills.values_list('name', flat=True))[:2]
            result_list.append({
                'id':            offer.id,
                'title':         offer.title,
                'company_name':  offer.company.company_name,
                'company_logo':  offer.company.logo.url if offer.company.logo else None,
                'match_score':   score,
                'top_skills':    top_skills,
                'location':      offer.wilaya or '',
                'already_applied': False,
            })
        return result_list
    except Exception:
        return []


class StudentProfileView(APIView):
    """
    GET: Retrieve student's full profile (domain, speciality, competencies)
    """
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        """Get the authenticated student's full profile"""
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentProfileSerializer(student)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request):
        """Update the authenticated student's profile fields"""
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentProfileSerializer(student, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Profile updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCompetenciesView(APIView):
    """
    GET: Retrieve all student's competencies
    POST: Add a new skill to student's competencies
    """
    permission_classes = [IsAuthenticated, IsStudent]
    
    def get(self, request):
        """Get all competencies for the authenticated student"""
        try:
            student = Student.objects.get(user=request.user)
            competencies = StudentSkill.objects.filter(student=student)
            serializer = StudentSkillSerializer(competencies, many=True)
            return Response(
                {"competencies": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request):
        """Add a new skill to the authenticated student's competencies"""
        try:
            student = Student.objects.get(user=request.user)
            
            # Get skill_id from request
            skill_id = request.data.get('skill_id')
            if not skill_id:
                return Response(
                    {"error": "skill_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if student already has this skill
            if StudentSkill.objects.filter(student=student, skill_id=skill_id).exists():
                return Response(
                    {"error": "Student already has this skill"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use serializer to validate and create
            serializer = StudentSkillSerializer(data={'skill_id': skill_id})
            if serializer.is_valid():
                # Manually set student before saving
                student_skill = serializer.save(student=student)
                return Response(
                    {
                        "message": "Skill added successfully",
                        "data": StudentSkillSerializer(student_skill).data
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCompetencyDetailView(APIView):
    """
    GET: Retrieve a specific student competency
    DELETE: Remove a skill from student's competencies
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request, competency_id):
        """Get details of a specific competency for the authenticated student"""
        try:
            student = Student.objects.get(user=request.user)
            competency = StudentSkill.objects.get(id=competency_id, student=student)
            serializer = StudentSkillSerializer(competency)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except StudentSkill.DoesNotExist:
            return Response(
                {"error": "Competency not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def delete(self, request, competency_id):
        """Delete a skill from the authenticated student's competencies"""
        try:
            student = Student.objects.get(user=request.user)
            competency = StudentSkill.objects.get(id=competency_id, student=student)
            skill_name = competency.skill.name
            competency.delete()
            return Response(
                {"message": f"Competency '{skill_name}' removed successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except StudentSkill.DoesNotExist:
            return Response(
                {"error": "Competency not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCVUploadView(APIView):
    """
    POST: Upload or replace student's CV file
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            cv_file = request.FILES.get('cv')
            if not cv_file:
                return Response(
                    {"error": "cv file is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            student.cv = cv_file
            student.save()
            serializer = StudentProfileSerializer(student)
            return Response(
                {"message": "CV uploaded successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCVDeleteView(APIView):
    """
    DELETE: Remove the student's CV file
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            # Check if student actually has a CV
            if not student.cv:
                return Response(
                    {"error": "No CV found to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Calling delete(save=True) file from /media/ storage
            student.cv.delete(save=True)
            
            return Response(
                {"message": "CV deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentCVDownloadView(APIView):
    """
    GET: Download the student's CV
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            if not student.cv:
                return Response(
                    {"error": "No CV found to download"},
                    status=status.HTTP_404_NOT_FOUND
                )
       
            file = student.cv.open('rb')
            filename = os.path.basename(student.cv.name) 
            
            response = FileResponse(file, as_attachment=True, filename=filename)
            return response
            
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentPictureUploadView(APIView):
    """
    POST: Upload or replace student's profile picture
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        try:
            student = Student.objects.get(user=request.user)
            picture_file = request.FILES.get('profile_picture')
            if not picture_file:
                return Response(
                    {"error": "profile_picture file is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # assign and save
            student.profile_picture = picture_file
            student.save()
            serializer = StudentProfileSerializer(student)
            return Response(
                {"message": "Profile picture uploaded successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StudentPictureDeleteView(APIView):
    """
    DELETE: Remove the student's profile picture
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def delete(self, request):
        try:
            student = Student.objects.get(user=request.user)
            
            if not student.profile_picture:
                return Response(
                    {"error": "No profile picture found to delete"},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            # Calling delete(save=True) file from /media/ storage
            student.profile_picture.delete(save=True)
            
            return Response(
                {"message": "Profile picture deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )
        except Student.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )

# ─────────────────────────────────────────────────────────────────────────────
# STUDENT DASHBOARD  →  GET /api/student/dashboard/
# ─────────────────────────────────────────────────────────────────────────────

class StudentDashboardView(APIView):
    """
    GET /api/student/dashboard/
    Returns stats card, recent activity feed, and top 3 recommended offers.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Applications
        applications          = Application.objects.filter(student=student)
        total_applications    = applications.count()
        accepted_applications = applications.filter(status='accepted').count()
        refused_applications  = applications.filter(status='rejected').count()
        pending_applications  = applications.filter(status='pending').count()

        # Skills
        all_skills      = StudentSkill.objects.filter(student=student)
        verified_skills = all_skills.filter(is_verified=True).count()
        total_skills    = all_skills.count()

        # Challenges
        challenges_completed = 0
        try:
            from challenges.models import SkillChallengeSubmission
            challenges_completed = SkillChallengeSubmission.objects.filter(
                student=student, passed=True
            ).count()
        except Exception:
            pass

        # Badges
        badges_earned = StudentBadge.objects.filter(student=student).count()

        return Response({
            'stats': {
                'average_match_score':   _get_average_match_score(student),
                'total_applications':    total_applications,
                'accepted_applications': accepted_applications,
                'refused_applications':  refused_applications,
                'pending_applications':  pending_applications,
                'verified_skills':       verified_skills,
                'total_skills':          total_skills,
                'upcoming_interviews':   _get_upcoming_interviews_count(student),
                'challenges_completed':  challenges_completed,
                'badges_earned':         badges_earned,
            },
            'profile_completeness': student.profile_completeness,
            'recent_activity':      _build_recent_activity(student),
            'recommended_offers':   _get_recommended_offers(student, limit=3),
        })


# ─────────────────────────────────────────────────────────────────────────────
# STUDENT ANALYTICS  →  GET /api/student/analytics/
# ─────────────────────────────────────────────────────────────────────────────

class StudentAnalyticsView(APIView):
    """
    GET /api/student/analytics/
    Deep performance metrics: applications, skills, match scores, challenges, badges.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # ── Applications ──────────────────────────────────────────────────
        applications = Application.objects.filter(student=student)
        total_apps   = applications.count()
        accepted     = applications.filter(status='accepted').count()
        refused      = applications.filter(status='rejected').count()
        pending      = applications.filter(status='pending').count()
        acceptance_rate = round(accepted / total_apps * 100, 1) if total_apps > 0 else 0.0

        # Monthly breakdown (last 6 months)
        from django.utils import timezone
        from django.db.models.functions import TruncMonth
        from django.db.models import Count
        monthly = (
            applications
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        monthly_applications = [
            {
                'month': m['month'].strftime('%B %Y'),
                'count': m['count']
            }
            for m in monthly
        ]

        # ── Skills ────────────────────────────────────────────────────────
        all_skills        = StudentSkill.objects.filter(student=student).select_related('skill')
        total_skills      = all_skills.count()
        verified_count    = all_skills.filter(is_verified=True).count()
        unverified_count  = all_skills.filter(is_verified=False).count()
        verification_rate = round(verified_count / total_skills * 100, 1) if total_skills > 0 else 0.0
        verified_names    = list(all_skills.filter(is_verified=True).values_list('skill__name', flat=True))
        unverified_names  = list(all_skills.filter(is_verified=False).values_list('skill__name', flat=True))

        # ── Match Scores ──────────────────────────────────────────────────
        scores_by_offer = []
        avg_score = 0
        highest   = 0
        lowest    = 100
        above_80  = 0
        try:
            from apps.matching.services import MatchingService
            active_offers = Offer.objects.filter(status='active')[:20]
            scores = []
            for offer in active_offers:
                try:
                    result = MatchingService.calculate_match_score(student.id, offer.id)
                    s = result['total_score']
                    scores.append(s)
                    if s > highest: highest = s
                    if s < lowest:  lowest  = s
                    if s >= 80:     above_80 += 1
                    scores_by_offer.append({
                        'offer_title':     offer.title,
                        'company':         offer.company.company_name,
                        'score':           s,
                        'already_applied': applications.filter(offer=offer).exists(),
                    })
                except Exception:
                    pass
            avg_score = round(sum(scores) / len(scores), 1) if scores else 0
            scores_by_offer.sort(key=lambda x: x['score'], reverse=True)
            if not scores:
                lowest = 0
        except Exception:
            lowest = 0

        # ── Challenges ────────────────────────────────────────────────────
        challenges_data     = []
        total_attempted     = 0
        total_passed_ch     = 0
        total_failed_ch     = 0
        pass_rate           = 0.0
        avg_challenge_score = 0
        try:
            from challenges.models import SkillChallengeSubmission
            subs            = SkillChallengeSubmission.objects.filter(student=student).select_related('challenge')
            total_attempted = subs.count()
            total_passed_ch = subs.filter(passed=True).count()
            total_failed_ch = subs.filter(passed=False).count()
            pass_rate       = round(total_passed_ch / total_attempted * 100, 1) if total_attempted > 0 else 0.0
            avg_result      = subs.aggregate(Avg('score'))
            avg_challenge_score = round(avg_result['score__avg'] or 0, 1)
            for sub in subs.order_by('-submitted_at')[:20]:
                challenges_data.append({
                    'skill':        sub.challenge.skill_name,
                    'score':        sub.score,
                    'passed':       sub.passed,
                    'submitted_at': sub.submitted_at.isoformat(),
                })
        except Exception:
            pass

        # ── Badges ────────────────────────────────────────────────────────
        badges = StudentBadge.objects.filter(student=student).order_by('-earned_at')
        badges_data = [
            {
                'badge_name':  b.badge_name,
                'badge_type':  b.badge_type,
                'description': b.description,
                'earned_at':   b.earned_at.isoformat(),
            }
            for b in badges
        ]

        return Response({
            'applications_summary': {
                'total':           total_apps,
                'pending':         pending,
                'accepted':        accepted,
                'refused':         refused,
                'acceptance_rate': acceptance_rate,
            },
            'monthly_applications': monthly_applications,
            'skills_summary': {
                'total_skills':        total_skills,
                'verified_skills':     verified_count,
                'unverified_skills':   unverified_count,
                'verification_rate':   verification_rate,
                'verified_skill_names':   verified_names,
                'unverified_skill_names': unverified_names,
            },
            'match_scores': {
                'average':  avg_score,
                'highest':  highest,
                'lowest':   lowest,
                'above_80': above_80,
                'by_offer': scores_by_offer,
            },
            'challenges_summary': {
                'total_attempted':    total_attempted,
                'total_passed':       total_passed_ch,
                'total_failed':       total_failed_ch,
                'pass_rate':          pass_rate,
                'average_score':      avg_challenge_score,
                'by_challenge':       challenges_data,
            },
            'badges': badges_data,
        })


# ─────────────────────────────────────────────────────────────────────────────
# STUDENT RECOMMENDATIONS  →  GET /api/student/recommendations/
# ─────────────────────────────────────────────────────────────────────────────

class StudentRecommendationsView(APIView):
    """
    GET /api/student/recommendations/
    Returns top matching offers the student hasn't applied to yet,
    with a breakdown of matching vs missing skills.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            from apps.matching.services import MatchingService

            applied_offer_ids = set(
                Application.objects.filter(student=student).values_list('offer_id', flat=True)
            )
            student_skill_names = set(
                StudentSkill.objects.filter(student=student).values_list('skill__name', flat=True)
            )
            verified_skill_names = set(
                StudentSkill.objects.filter(student=student, is_verified=True).values_list('skill__name', flat=True)
            )

            active_offers = Offer.objects.filter(status='active').exclude(
                id__in=applied_offer_ids
            ).prefetch_related('skills', 'durations')

            scored = []
            for offer in active_offers[:40]:
                try:
                    result = MatchingService.calculate_match_score(student.id, offer.id)
                    scored.append((result['total_score'], result['breakdown'], offer))
                except Exception:
                    pass

            scored.sort(key=lambda x: x[0], reverse=True)

            recommendations = []
            for score, breakdown, offer in scored[:10]:
                required_skills    = list(offer.skills.values_list('name', flat=True))
                matching_skills    = [s for s in required_skills if s in student_skill_names]
                missing_skills     = [s for s in required_skills if s not in student_skill_names]
                verified_matching  = [s for s in required_skills if s in verified_skill_names]

                duration = None
                if offer.durations.exists():
                    duration = f"{offer.durations.first().months} months"

                # Build human-readable reason
                if score >= 80:
                    reason = f"{score}% match — strong profile fit"
                elif matching_skills:
                    reason = f"{score}% match — you have {len(matching_skills)} of {len(required_skills)} required skills"
                else:
                    reason = f"{score}% match based on your speciality and location"

                recommendations.append({
                    'offer_id':               offer.id,
                    'title':                  offer.title,
                    'company_name':           offer.company.company_name,
                    'company_logo':           offer.company.logo.url if offer.company.logo else None,
                    'match_score':            score,
                    'score_breakdown':        breakdown,
                    'required_skills':        required_skills,
                    'student_matching_skills': matching_skills,
                    'verified_matching_skills': verified_matching,
                    'missing_skills':         missing_skills,
                    'location':               offer.wilaya or '',
                    'duration':               duration,
                    'why_recommended':        reason,
                })

            return Response({'recommendations': recommendations})

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─────────────────────────────────────────────────────────────────────────────
# STUDENT APPLICATION STATS  →  GET /api/student/applications/stats/
# ─────────────────────────────────────────────────────────────────────────────

class StudentApplicationStatsView(APIView):
    """
    GET /api/student/applications/stats/
    Quick stats summary used by the My Applications page header.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        try:
            student = Student.objects.get(user=request.user)
        except Student.DoesNotExist:
            return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)

        applications  = Application.objects.filter(student=student)
        total         = applications.count()
        accepted      = applications.filter(status='accepted').count()
        refused       = applications.filter(status='rejected').count()
        pending       = applications.filter(status='pending').count()
        acceptance_rate = round(accepted / total * 100, 1) if total > 0 else 0.0

        return Response({
            'total':           total,
            'accepted':        accepted,
            'refused':         refused,
            'pending':         pending,
            'acceptance_rate': acceptance_rate,
        })
