from .ollama_generator import generate_challenge
from .speciality_skills import SPECIALITY_SKILLS


def seed_all_challenges(speciality_filter=None):
    """
    Generate and save challenges for all specialities using Ollama.
    Pass speciality_filter="Computer Science" to seed only one speciality.
    """
    from challenges.models import SkillChallenge

    results = []
    specialities = SPECIALITY_SKILLS.items()

    if speciality_filter:
        specialities = [
            (s, skills) for s, skills in specialities if s == speciality_filter
        ]

    for speciality, skills in specialities:
        for skill in skills:
            skill_name     = skill["name"]
            difficulty     = skill["difficulty"]
            language       = skill.get("language")
            challenge_type = skill["type"]

            # Limit to e.g. 3 challenges per skill to avoid infinite growth
            if SkillChallenge.objects.filter(skill_name=skill_name).count() >= 3:
                results.append({
                    "skill": skill_name,
                    "speciality": speciality,
                    "status": "skipped (already has 3 versions)"
                })
                continue

            try:
                data = generate_challenge(
                    skill_name=skill_name,
                    difficulty=difficulty,
                    language=language,
                    challenge_type=challenge_type,
                )

                SkillChallenge.objects.create(
                    skill_name=skill_name,
                    speciality=speciality,
                    language=language,
                    challenge_type=challenge_type,
                    difficulty=difficulty,
                    title=data["title"],
                    description=data["description"],
                    # coding fields
                    starter_code=data.get("starter_code"),
                    test_cases=data.get("test_cases"),
                    # qcm fields → stored in questions
                    # text criteria → also stored in questions
                    questions=data.get("questions") or data.get("evaluation_criteria"),
                    time_limit_minutes=data.get("time_limit_minutes", 15),
                )

                results.append({
                    "skill": skill_name,
                    "speciality": speciality,
                    "type": challenge_type,
                    "status": "created"
                })

            except Exception as e:
                results.append({
                    "skill": skill_name,
                    "speciality": speciality,
                    "status": " error",
                    "error": str(e)
                })

    return results