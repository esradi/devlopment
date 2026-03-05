import numpy as np
from django.db.models import Avg
from apps.accounts.models import Student, StudentSkill
from apps.offers.models import Offer, ChallengeSubmission

class MatchingService:
    """
    Advanced AI Matching Service to calculate a score between 0-100 
    between a Student and an Offer based on weighted attributes.
    """
    WEIGHTS = {
        "speciality": 0.30,   # 30%
        "skills": 0.45,       # 45%
        "challenges": 0.15,   # 15%
        "location": 0.10,     # 10%
    }

    @staticmethod
    def calculate_match_score(student_id, offer_id) -> dict:
        """
        Main entry point to calculate the weighted matching score.
        """
        student = Student.objects.get(pk=student_id)
        offer = Offer.objects.get(pk=offer_id)

        speciality_score = MatchingService._calculate_speciality_score(student, offer)
        skills_score = MatchingService._calculate_skills_score(student, offer)
        challenges_score = MatchingService._calculate_challenges_score(student, offer)
        location_score = MatchingService._calculate_location_score(student, offer)

        scores = np.array([
            speciality_score,
            skills_score,
            challenges_score,
            location_score,
        ])

        weights = np.array([
            MatchingService.WEIGHTS["speciality"],
            MatchingService.WEIGHTS["skills"],
            MatchingService.WEIGHTS["challenges"],
            MatchingService.WEIGHTS["location"],
        ])

        total_score = float(np.dot(scores, weights))

        return {
            "total_score": round(total_score, 2),
            "breakdown": {
                "speciality": speciality_score,
                "skills": skills_score,
                "challenges": challenges_score,
                "location": location_score,
            },
            "weights": MatchingService.WEIGHTS
        }

    @staticmethod
    def _calculate_speciality_score(student, offer) -> float:
        """
        Calculates speciality score (0-100) using two independent checks:
        - Domain match (50 pts): student.domain vs offer's Domain tags (broad category)
        - Speciality match (50 pts): student.speciality vs offer title or domain names (precision)
        """
        score = 0

        # ── 1. Domain check (50 pts) ──────────────────────────────────────────
        # student.domain = "Engineering", offer.domains = [Domain("Engineering")]
        if student.domain:
            domain_match = offer.domains.filter(name__iexact=student.domain).exists()
            if domain_match:
                score += 50

        # ── 2. Speciality check (50 pts) ─────────────────────────────────────
        # student.speciality = "Computer Science"
        # We match against offer title AND offer domain names
        if student.speciality:
            spec_lower = student.speciality.lower()
            # a) Speciality keyword found in offer title
            title_match = offer.title and spec_lower in offer.title.lower()
            # b) Speciality matches a domain tag (e.g. offer tagged "Computer Science")
            domain_tag_match = offer.domains.filter(name__iexact=student.speciality).exists()
            if title_match or domain_tag_match:
                score += 50

        return float(score)  # already out of 100

    @staticmethod
    def _calculate_skills_score(student, offer) -> float:
        """
        Calculates skills score (0-100) based on verified skills matching offer requirements.
        """
        required_skills = offer.skills.all()
        if not required_skills.exists():
            # If offer has no required skills, give 100% if student has any skill, else 0%
            return 100.0 if student.skills.exists() else 0.0

        verified_student_skills = StudentSkill.objects.filter(
            student=student, 
            skill__in=required_skills, 
            is_verified=True
        ).count()

        return (verified_student_skills / required_skills.count()) * 100

    @staticmethod
    def _calculate_challenges_score(student, offer) -> float:
        """
        Calculates challenges score (0-100) based on average score of relevant passed challenges.
        """
        required_skills = offer.skills.all()
        
        relevant_submissions = ChallengeSubmission.objects.filter(
            student=student,
            result='pass'
        )

        if required_skills.exists():
            relevant_submissions = relevant_submissions.filter(challenge__skill__in=required_skills)
        else:
            # Fallback: same domain as offer
            # Assuming Challenge has a domain field or we infer it from skill
            # For now, let's keep it simple as per requirements
            offer_domain_names = offer.domains.values_list('name', flat=True)
            # This logic depends on Challenge model having domain reachability.
            # If no domain on challenge, we just take all passed challenges.
            pass

        if relevant_submissions.exists():
            avg_score = relevant_submissions.aggregate(Avg('score'))['score__avg']
            return float(avg_score)
        
        return 0.0

    @staticmethod
    def _calculate_location_score(student, offer) -> float:
        """
        Calculates location score (0-100).
        Binary match on wilaya.
        """
        if student.wilaya and offer.wilaya and student.wilaya.lower() == offer.wilaya.lower():
            return 100.0
        return 0.0
