import numpy as np
from django.db.models import Avg, Q
from apps.accounts.models import Student, StudentSkill
from apps.offers.models import Offer


class MatchingService:
    WEIGHTS = {
        "speciality": 0.30,
        "skills":     0.45,
        "challenges": 0.15,
        "location":   0.10,
    }

    @staticmethod
    def calculate_match_score(student_id, offer_id) -> dict:
        student = Student.objects.get(pk=student_id)
        offer   = Offer.objects.get(pk=offer_id)

        speciality_score = MatchingService._calculate_speciality_score(student, offer)
        skills_score     = MatchingService._calculate_skills_score(student, offer)
        challenges_score = MatchingService._calculate_challenges_score(student, offer)
        location_score   = MatchingService._calculate_location_score(student, offer)

        scores  = np.array([speciality_score, skills_score, challenges_score, location_score])
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
                "skills":     skills_score,
                "challenges": challenges_score,
                "location":   location_score,
            },
            "weights": MatchingService.WEIGHTS,
        }

    @staticmethod
    def recalculate_all_scores():
        from .models import MatchScore
        students = Student.objects.all()
        offers = Offer.objects.filter(status='active')  # Assuming we only match against active offers

        # Efficiently calculate and save all scores
        for student in students:
            for offer in offers:
                try:
                    result = MatchingService.calculate_match_score(student.pk, offer.pk)
                    MatchScore.objects.update_or_create(
                        student=student,
                        offer=offer,
                        defaults={
                            'total_score': result['total_score'],
                            'breakdown': result['breakdown']
                        }
                    )
                except Exception as e:
                    print(f"Error calculating match for Student {student.pk} and Offer {offer.pk}: {e}")

    @staticmethod
    def _calculate_speciality_score(student, offer) -> float:
        score = 0
        if student.domain:
            if offer.domains.filter(name__iexact=student.domain).exists():
                score += 50
        if student.speciality:
            spec_lower       = student.speciality.lower()
            title_match      = offer.title and spec_lower in offer.title.lower()
            domain_tag_match = offer.domains.filter(name__iexact=student.speciality).exists()
            if title_match or domain_tag_match:
                score += 50
        return float(score)

    @staticmethod
    def _calculate_skills_score(student, offer) -> float:
        required_skills = offer.skills.all()
        if not required_skills.exists():
            return 100.0 if student.skills.exists() else 0.0
        verified_count = StudentSkill.objects.filter(
            student=student,
            skill__in=required_skills,
            is_verified=True
        ).count()
        return (verified_count / required_skills.count()) * 100

    @staticmethod
    def _calculate_challenges_score(student, offer) -> float:
        """
        Hybrid Logic: 70% Specific Skills + 30% Domain Proficiency.
        Rewards both mastering the required stack and general area competence.
        """
        try:
            from challenges.models import SkillChallengeSubmission, SkillChallenge

            required_skills = list(offer.skills.values_list('name', flat=True))
            offer_domains   = list(offer.domains.values_list('name', flat=True))

            # 1. SPECIFIC SKILLS (70%)
            exact_score = 0.0
            if required_skills:
                exact_subs = SkillChallengeSubmission.objects.filter(
                    student=student,
                    challenge__skill_name__in=required_skills,
                    passed=True
                )
                if exact_subs.exists():
                    exact_score = float(exact_subs.aggregate(Avg('score'))['score__avg'] or 0)

            # 2. DOMAIN PROFICIENCY (30%)
            domain_score = 0.0
            if offer_domains:
                domain_subs = SkillChallengeSubmission.objects.filter(
                    student=student,
                    challenge__speciality__in=offer_domains,
                    passed=True
                )
                if domain_subs.exists():
                    # Reward average performance across any challenge in this specialty
                    avg_perf = float(domain_subs.aggregate(Avg('score'))['score__avg'] or 0)
                    # Reward breadth: how many different verified skills in this domain?
                    verified_count = domain_subs.values('challenge').distinct().count()
                    breadth_factor = min(verified_count / 3.0, 1.0) # Fully rewards 3+ verified skills
                    domain_score = avg_perf * breadth_factor

            # Combine
            if not required_skills:
                return domain_score
            
            return (exact_score * 0.70) + (domain_score * 0.30)

        except Exception as e:
            print(f"[matching] _calculate_challenges_score error: {e}")

        return 0.0

    @staticmethod
    def _calculate_location_score(student, offer) -> float:
        """Simple location matching using wilaya."""
        if not student.wilaya or not offer.wilaya:
            return 50.0
        if student.wilaya.strip().lower() == offer.wilaya.strip().lower():
            return 100.0
        return 0.0