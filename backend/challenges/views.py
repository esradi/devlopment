import random
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
PREP_TIME_SECONDS = 30

@api_view(['GET'])
@permission_classes([IsStudent])
def list_challenges(request):
    """
    Returns unique skills available for the student's speciality.
    """
    student    = request.user.student_profile
    speciality = student.speciality
    challenge_type = request.query_params.get('type') # 'coding', 'qcm', 'text'
    qs = SkillChallenge.objects.filter(speciality=speciality)
    if challenge_type:
        qs = qs.filter(challenge_type=challenge_type)
        
    skill_names = qs.values_list('skill_name', flat=True).distinct()
    
    data = []
    for skill_name in skill_names:
        ch = SkillChallenge.objects.filter(skill_name=skill_name).first()
        
        submissions = SkillChallengeSubmission.objects.filter(
            student=student, 
            challenge__skill_name=skill_name
        ).order_by('-submitted_at')
        
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
            "skill_name":         skill_name,
            "title":              ch.title if ch else skill_name,
            "difficulty":         ch.difficulty if ch else "medium",
            "challenge_type":     ch.challenge_type if ch else "coding",
            "language":           ch.language if ch else None,
            "time_limit_minutes": ch.time_limit_minutes if ch else 15,
            "status":             sub_status,
            "score":              passed_sub.score if passed_sub else (last_sub.score if last_sub else None),
            "attempts_used":      attempts_used,
            "attempts_remaining": max(0, MAX_ATTEMPTS - attempts_used),
            "retry_at":           retry_at,
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsStudent])
def start_challenge_session(request, skill_name):
    """Pick a random challenge for the skill and starts the 30-second focus timer."""
    student = request.user.student_profile
  
    existing = ChallengeSession.objects.filter(
        student=student, 
        challenge__skill_name=skill_name, 
        is_completed=False
    ).first()
    
    if existing:
        total_limit = PREP_TIME_SECONDS + (existing.challenge.time_limit_minutes * 60)
        elapsed = (timezone.now() - existing.start_time).total_seconds()
        if elapsed < total_limit:
             return Response({
                "message": "Session already in progress.",
                "start_time": existing.start_time,
                "prep_seconds": PREP_TIME_SECONDS,
                "remaining_seconds": round(total_limit - elapsed, 1)
            })
        else:
            existing.is_completed = True
            existing.save()

    pool = list(SkillChallenge.objects.filter(skill_name=skill_name))
    if not pool:
        return Response({"error": "No challenges found for this skill."}, status=404)

    challenge = random.choice(pool)
    
    session = ChallengeSession.objects.create(
        student=student,
        challenge=challenge,
        is_completed=False
    )
    
    return Response({
        "message": "Preparation timer started.",
        "start_time": session.start_time,
        "prep_seconds": PREP_TIME_SECONDS,
        "challenge_id": challenge.id
    })


@api_view(['GET'])
@permission_classes([IsStudent])
def challenge_detail(request, skill_name):
    """
    Returns full challenge details.
    """
    student = request.user.student_profile
    session = ChallengeSession.objects.filter(
        student=student, 
        challenge__skill_name=skill_name, 
        is_completed=False
    ).first()
    
    if not session:
        return Response({
            "error": "You must start the session before accessing the challenge content.",
            "requires_session": True
        }, status=403)

    elapsed_seconds = (timezone.now() - session.start_time).total_seconds()
  
    if elapsed_seconds < PREP_TIME_SECONDS:
        return Response({
            "error": "Focus mode active. Please wait for the timer to finish.",
            "wait_seconds": round(PREP_TIME_SECONDS - elapsed_seconds, 1)
        }, status=403)

    total_allowed = PREP_TIME_SECONDS + (session.challenge.time_limit_minutes * 60)
    if elapsed_seconds > total_allowed:
        session.is_completed = True
        session.save()
        return Response({
            "error": "Time expired. You can no longer access this challenge session.",
            "expired": True
        }, status=403)

    challenge = session.challenge
    submissions   = SkillChallengeSubmission.objects.filter(student=student, challenge__skill_name=skill_name)
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
        "remaining_seconds":  round(total_allowed - elapsed_seconds, 1),
        "difficulty":         challenge.difficulty,
        "attempts_used":      attempts_used,
        "attempts_remaining": max(0, MAX_ATTEMPTS - attempts_used),
        "starter_code": challenge.starter_code if challenge.challenge_type == "coding" else None,
        "questions":    safe_questions,
    })

@api_view(['POST'])
@permission_classes([IsStudent])
def submit_challenge(request, skill_name):
    student = request.user.student_profile
    session = ChallengeSession.objects.filter(
        student=student, 
        challenge__skill_name=skill_name, 
        is_completed=False
    ).first()
    
    if not session:
         return Response({"error": "No active session found. Start the challenge first."}, status=400)

    elapsed_seconds = (timezone.now() - session.start_time).total_seconds()
    total_allowed = PREP_TIME_SECONDS + (session.challenge.time_limit_minutes * 60)
    
    if elapsed_seconds > total_allowed:
        session.is_completed = True
        session.save()
        return Response({"error": "Time expired. Your submission was not accepted."}, status=403)

    challenge = session.challenge
    submissions   = SkillChallengeSubmission.objects.filter(student=student, challenge__skill_name=skill_name).order_by('-submitted_at')
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

@api_view(['GET'])
@permission_classes([IsStudent])
def challenge_history(request, skill_name):
    """
    Returns all submission history (attempts, scores, dates) for a specific skill.
    """
    student = request.user.student_profile
    submissions = SkillChallengeSubmission.objects.filter(
        student=student, 
        challenge__skill_name=skill_name
    ).order_by('-submitted_at')
    
    data = [
        {
            "id": sub.id,
            "challenge_title": sub.challenge.title,
            "challenge_type": sub.challenge.challenge_type,
            "score": sub.score,
            "passed": sub.passed,
            "feedback": sub.feedback,
            "submitted_at": sub.submitted_at,
        }
        for sub in submissions
    ]
    
    return Response(data)

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