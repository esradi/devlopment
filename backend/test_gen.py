import os
import sys
import django

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from challenges.services.generator_service import seed_all_challenges
from challenges.models import SkillChallenge

def test_generation():
    print("Testing AI Challenge Generation for 'Machine Learning'...")
    # Clean up existing to force generation
    SkillChallenge.objects.filter(skill_name="Machine Learning Basics").delete()
    
    # We pass a specialty filter that contains this skill (based on speciality_skills.py)
    results = seed_all_challenges(speciality_filter="Computer Science")
    
    found = False
    for res in results:
        if res.get("skill") == "Machine Learning Basics":
            print(f"Status for Machine Learning Basics: {res.get('status')}")
            if res.get("status") == "created":
                found = True
            elif "error" in res:
                print(f"Error: {res.get('error')}")
    
    if found:
        challenge = SkillChallenge.objects.get(skill_name="Machine Learning Basics")
        print(f"Successfully created challenge: {challenge.title}")
        print(f"Type: {challenge.challenge_type}")
        print(f"Description snippet: {challenge.description[:100]}...")
    else:
        print("Failed to create challenge or skill not found in results.")

if __name__ == "__main__":
    test_generation()
