from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta

from apps.api.permissions import IsStudent
from .models import SkillChallenge, SkillChallengeSubmission, ChallengeSession
from .services.ollama_generator import grade_submission

MAX_ATTEMPTS  = 3
PASS_THRESHOLD = 70

# ─────────────────────────────────────────────────────────
# LIST CHALLENGES  →  GET /api/challenges/
# ─────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsStudent])
def list_challenges(request):
    """
    Returns all challenges for the student's speciality
    with their current status, score and attempt info.
    """
    student    = request.user.student_profile
    speciality = student.speciality
    challenges = SkillChallenge.objects.filter(speciality=speciality)
    data       = []

    for ch in challenges:
        submissions   = SkillChallengeSubmission.objects.filter(student=student, challenge=ch).order_by('-submitted_at')
        attempts_used = submissions.count()
        last_sub      = submissions.first()
        passed_sub    = submissions.filter(passed=True).first()

        if passed_sub:
            sub_status = "passed"
            retry_at   = None
        elif attempts_used >= MAX_ATTEMPTS:
            sub_status = "max_attempts_reached"
            retry_at   = None
        elif last_sub:
            hours_since = (timezone.now() - last_sub.submitted_at).total_seconds() / 3600
            if hours_since < 24:
                retry_at   = (last_sub.submitted_at + timedelta(hours=24)).isoformat()
                sub_status = "failed"
            else:
                sub_status = "retry_available"
                retry_at   = None
        else:
            sub_status = "not_started"
            retry_at   = None

        data.append({
            "skill_name":         ch.skill_name,
            "title":              ch.title,
            "difficulty":         ch.difficulty,
            "challenge_type":     ch.challenge_type,
            "language":           ch.language,
            "time_limit_minutes": ch.time_limit_minutes,
            "status":             sub_status,
            "score":              passed_sub.score if passed_sub else (last_sub.score if last_sub else None),
            "attempts_used":      attempts_used,
            "attempts_remaining": max(0, MAX_ATTEMPTS - attempts_used),
            "retry_at":           retry_at,
        })

    return Response(data)

# ─────────────────────────────────────────────────────────
# START SESSION (TIMER) → POST /api/challenges/<skill_name>/start/
# ─────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsStudent])
def start_challenge_session(request, skill_name):
    """Starts the 30-second focus timer."""
    student = request.user.student_profile
    challenge = get_object_or_404(SkillChallenge, skill_name=skill_name)
    
    # Complete any old (forgotten) sessions for this challenge
    ChallengeSession.objects.filter(student=student, challenge=challenge, is_completed=False).delete()
    
    session = ChallengeSession.objects.create(
        student=student,
        challenge=challenge,
        is_completed=False
    )
    
    return Response({
        "message": "Preparation timer started.",
        "start_time": session.start_time,
        "prep_seconds": 30
    })

# ─────────────────────────────────────────────────────────
# CHALLENGE DETAIL  →  GET /api/challenges/<skill_name>/
# ─────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsStudent])
def challenge_detail(request, skill_name):
    """
    Returns full challenge details.
    ENFORCES the 30-second timer.
    """
    student   = request.user.student_profile
    challenge = get_object_or_404(SkillChallenge, skill_name=skill_name)

    session = ChallengeSession.objects.filter(student=student, challenge=challenge, is_completed=False).first()
    
    if not session:
        return Response({
            "error": "You must start the session before accessing the challenge content.",
            "requires_session": True
        }, status=403)
    
    if not session.preparation_over:
        time_left = 30 - (timezone.now() - session.start_time).total_seconds()
        return Response({
            "error": "Focus mode active. Please wait for the timer to finish.",
            "wait_seconds": round(max(0, time_left), 1)
        }, status=403)

    submissions   = SkillChallengeSubmission.objects.filter(student=student, challenge=challenge)
    attempts_used = submissions.count()

    safe_questions = None
    if challenge.challenge_type == "qcm" and challenge.questions:
        safe_questions = [
            {
                "index":    q["index"],
                "question": q["question"],
                "options":  q["options"],
            }
            for q in challenge.questions
        ]

    return Response({
        "skill_name":         challenge.skill_name,
        "title":              challenge.title,
        "description":        challenge.description,
        "challenge_type":     challenge.challenge_type,
        "language":           challenge.language,
        "time_limit_minutes": challenge.time_limit_minutes,
        "difficulty":         challenge.difficulty,
        "attempts_used":      attempts_used,
        "attempts_remaining": max(0, MAX_ATTEMPTS - attempts_used),
        "starter_code": challenge.starter_code if challenge.challenge_type == "coding" else None,
        "questions":    safe_questions,
    })

@api_view(['POST'])
@permission_classes([IsStudent])
def submit_challenge(request, skill_name):
    student   = request.user.student_profile
    challenge = get_object_or_404(SkillChallenge, skill_name=skill_name)

    session = ChallengeSession.objects.filter(student=student, challenge=challenge, is_completed=False).first()
    if not session:
         return Response({"error": "No active session found. Start the challenge first."}, status=400)

    submissions   = SkillChallengeSubmission.objects.filter(student=student, challenge=challenge).order_by('-submitted_at')
    attempts_used = submissions.count()
    last_sub      = submissions.first()

    if submissions.filter(passed=True).exists():
        return Response({"error": "You already passed this challenge."}, status=400)

    if attempts_used >= MAX_ATTEMPTS:
        return Response({"error": "Max attempts reached."}, status=400)

    if last_sub and not last_sub.passed:
        hours_since = (timezone.now() - last_sub.submitted_at).total_seconds() / 3600
        if hours_since < 24:
            return Response({"error": "Cooldown active. Try later."}, status=429)

    submission_data = {}
    if challenge.challenge_type == "coding":
        submission_data["code"] = request.data.get("code", "")
    elif challenge.challenge_type == "qcm":
        submission_data["answers"] = request.data.get("answers", {})
    elif challenge.challenge_type == "text":
        submission_data["text"] = request.data.get("text", "")

    try:
        result = grade_submission(challenge, submission_data)
    except Exception as e:
        return Response({"error": f"Grading failed: {str(e)}"}, status=500)

    score  = result["score"]
    passed = score >= PASS_THRESHOLD

    SkillChallengeSubmission.objects.create(
        student           = student,
        challenge         = challenge,
        submitted_code    = submission_data.get("code"),
        submitted_answers = submission_data.get("answers"),
        submitted_text    = submission_data.get("text"),
        score             = score,
        passed            = passed,
        feedback          = result.get("overall_feedback", ""),
    )

    # Close session
    session.is_completed = True
    session.save()

    if passed:
        _on_pass(student, challenge, score)

    return Response({
        "passed": passed,
        "score": score,
        "feedback": result.get("overall_feedback", ""),
    })

def _on_pass(student, challenge, score):
    _mark_skill_verified(student, challenge)
    _unlock_badge(student, challenge)
    _send_pass_notification(student, challenge, score)

def _mark_skill_verified(student, challenge):
    try:
        from apps.accounts.models import StudentSkill
        from apps.offers.models import Skill
        skill_obj, _ = Skill.objects.get_or_create(name=challenge.skill_name)
        student_skill, _ = StudentSkill.objects.get_or_create(student=student, skill=skill_obj)
        student_skill.is_verified = True
        student_skill.save()
    except Exception as e: print(f"Error: {e}")

def _unlock_badge(student, challenge):
    try:
        from apps.accounts.models import StudentBadge
        StudentBadge.objects.get_or_create(
            student    = student,
            badge_name = f"{challenge.skill_name} Master",
            defaults   = {
                "badge_type":  challenge.difficulty,
                "description": f"Verified expertise in {challenge.skill_name}",
            }
        )
    except Exception as e: print(f"Badge Error: {e}")

def _send_pass_notification(student, challenge, score):
    try:
        from apps.notifications.models import Notification
        Notification.objects.create(
            user    = student.user,
            type    = "challenge_passed",
            title   = f"Challenge Passed: {challenge.skill_name}",
            message = f"You scored {score}% and verified this skill!",
        )
    except Exception as e: print(f"Notify Error: {e}")