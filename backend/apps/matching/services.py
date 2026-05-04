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

        # Build active dimensions — exclude those with no meaningful data
        dimensions = {}

        # Speciality: active if student has domain or speciality set
        if student.domain or student.speciality:
            dimensions["speciality"] = speciality_score

        # Skills: active if the offer has required skills AND student has some skills
        if offer.skills.exists() and student.skills.exists():
            dimensions["skills"] = skills_score

        # Challenges: active if score > 0 (student completed relevant challenges)
        if challenges_score > 0:
            dimensions["challenges"] = challenges_score

        # Location: active if both student and offer have wilaya set
        if student.wilaya and offer.wilaya:
            dimensions["location"] = location_score

        # If no dimensions are active, compute a profile-completeness baseline
        if not dimensions:
            baseline = MatchingService._calculate_baseline_score(student, offer)
            return {
                "total_score": round(baseline, 2),
                "breakdown": {
                    "speciality": speciality_score,
                    "skills":     skills_score,
                    "challenges": challenges_score,
                    "location":   location_score,
                },
                "weights": MatchingService.WEIGHTS,
            }

        # Redistribute weights proportionally among active dimensions
        active_weights = {k: MatchingService.WEIGHTS[k] for k in dimensions}
        total_weight = sum(active_weights.values())
        normalized_weights = {k: v / total_weight for k, v in active_weights.items()}

        total_score = sum(dimensions[k] * normalized_weights[k] for k in dimensions)

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
    def _calculate_baseline_score(student, offer) -> float:
        """
        Fallback score when no structured dimensions have enough data.
        Based on profile completeness + lightweight keyword overlap.
        Returns a score in the 15-55 range to differentiate candidates.
        """
        score = 15.0  # Base score for applying

        # Profile completeness bonuses
        if student.cv:
            score += 10
        if student.domain:
            score += 5
        if student.speciality:
            score += 5
        if student.university:
            score += 3
        if student.wilaya:
            score += 2

        # Lightweight keyword overlap between student field and offer
        offer_text = f"{offer.title or ''} {offer.description or ''}".lower()
        student_keywords = set()
        if student.domain:
            student_keywords.update(student.domain.lower().split())
        if student.speciality:
            student_keywords.update(student.speciality.lower().split())

        if student_keywords and offer_text:
            matches = sum(1 for kw in student_keywords if len(kw) > 2 and kw in offer_text)
            score += min(matches * 5, 15)

        return min(score, 55.0)

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
        offer_text = f"{offer.title or ''} {offer.description or ''}".lower()

        if student.domain:
            domain_lower = student.domain.lower()
            # Check structured domains
            if offer.domains.filter(name__iexact=student.domain).exists():
                score += 50
            # Also check offer title and description
            elif domain_lower in offer_text:
                score += 40

        if student.speciality:
            spec_lower = student.speciality.lower()
            # Check structured domains
            domain_tag_match = offer.domains.filter(name__iexact=student.speciality).exists()
            # Check offer title and description
            title_match = offer.title and spec_lower in offer.title.lower()
            desc_match = spec_lower in offer_text
            if domain_tag_match:
                score += 50
            elif title_match:
                score += 45
            elif desc_match:
                score += 30

        return min(float(score), 100.0)

    @staticmethod
    def _calculate_skills_score(student, offer) -> float:
        required_skills = offer.skills.all()
        if not required_skills.exists():
            return 100.0 if student.skills.exists() else 0.0

        total_required = required_skills.count()

        # Count declared (all) and verified skill matches
        all_matches = StudentSkill.objects.filter(
            student=student,
            skill__in=required_skills
        )
        declared_count = all_matches.count()
        verified_count = all_matches.filter(is_verified=True).count()
        unverified_count = declared_count - verified_count

        # Verified skills = full credit, declared-only skills = 60% credit
        weighted_count = verified_count + (unverified_count * 0.6)

        return min((weighted_count / total_required) * 100, 100.0)

    @staticmethod
    def _calculate_challenges_score(student, offer) -> float:
        """
        Hybrid Logic: 70% Specific Skills + 30% Domain Proficiency.
        Rewards both mastering the required stack and general area competence.
        """
        try:
            from apps.challenges.models import SkillChallengeSubmission, SkillChallenge

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