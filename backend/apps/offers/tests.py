from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.offers.models import Offer, Skill, Domain, Challenge, ChallengeSubmission
from apps.accounts.models import Student, Company, StudentSkill
from apps.matching.services import MatchingService
import numpy as np

User = get_user_model()

class AdvancedMatchingTests(TestCase):
    def setUp(self):
        # Create domains
        self.domain_it = Domain.objects.create(name='IT')
        
        # Create skills
        self.skill_python = Skill.objects.create(name='Python')
        self.skill_django = Skill.objects.create(name='Django')
        
        # Create a company
        self.user_company = User.objects.create_user(
            email='company@test.com', username='company@test.com', password='password', role='company'
        )
        self.company = Company.objects.create(user=self.user_company, company_name='Test Tech')
        
        # Create an offer
        self.offer = Offer.objects.create(
            company=self.company,
            title='Python Developer',
            wilaya='Algiers'
        )
        self.offer.domains.add(self.domain_it)
        self.offer.skills.add(self.skill_python, self.skill_django)
        
        # Create a student
        self.user_student = User.objects.create_user(
            email='student@test.com', username='student@test.com', password='password', role='student'
        )
        self.student = Student.objects.create(
            user=self.user_student, 
            first_name='Aya', 
            last_name='Kettab',
            domain='IT',
            speciality='Python',
            wilaya='Algiers'
        )

    def test_speciality_score(self):
        # Domain matches (15) + Speciality (found in title) (15) = 30/30 -> 100%
        score = MatchingService._calculate_speciality_score(self.student, self.offer)
        self.assertEqual(score, 100.0)

        # Different domain
        self.student.domain = 'Medicine'
        score = MatchingService._calculate_speciality_score(self.student, self.offer)
        self.assertTrue(score < 100.0)

    def test_skills_score(self):
        # Student has no skills yet -> 0%
        score = MatchingService._calculate_skills_score(self.student, self.offer)
        self.assertEqual(score, 0.0)

        # Student adds skills but not verified -> still 0%
        self.student.skills.add(self.skill_python, self.skill_django)
        score = MatchingService._calculate_skills_score(self.student, self.offer)
        self.assertEqual(score, 0.0)

        # Verify one skill (50% of 2 required)
        ss = StudentSkill.objects.get(student=self.student, skill=self.skill_python)
        ss.is_verified = True
        ss.save()
        score = MatchingService._calculate_skills_score(self.student, self.offer)
        self.assertEqual(score, 50.0)

        # Verify both skills -> 100%
        ss2 = StudentSkill.objects.get(student=self.student, skill=self.skill_django)
        ss2.is_verified = True
        ss2.save()
        score = MatchingService._calculate_skills_score(self.student, self.offer)
        self.assertEqual(score, 100.0)

    def test_location_score(self):
        # Same wilaya -> 100%
        score = MatchingService._calculate_location_score(self.student, self.offer)
        self.assertEqual(score, 100.0)

        # Different wilaya -> 0%
        self.student.wilaya = 'Oran'
        score = MatchingService._calculate_location_score(self.student, self.offer)
        self.assertEqual(score, 0.0)

    def test_challenges_score(self):
        # No challenges -> 0%
        score = MatchingService._calculate_challenges_score(self.student, self.offer)
        self.assertEqual(score, 0.0)

        # Passed challenge with score 80
        challenge = Challenge.objects.create(name='Python Test', skill=self.skill_python)
        ChallengeSubmission.objects.create(
            student=self.student,
            challenge=challenge,
            score=80.0,
            result='pass'
        )
        score = MatchingService._calculate_challenges_score(self.student, self.offer)
        self.assertEqual(score, 80.0)

    def test_total_match_score(self):
        # Set up a 100% match case
        # Speciality: 100
        # Skills: 100
        # Challenges: 100
        # Location: 100
        
        # Verify skills
        self.student.skills.add(self.skill_python, self.skill_django)
        StudentSkill.objects.filter(student=self.student).update(is_verified=True)
        
        # Add challenge
        challenge = Challenge.objects.create(name='Python Test', skill=self.skill_python)
        ChallengeSubmission.objects.create(
            student=self.student,
            challenge=challenge,
            score=100.0,
            result='pass'
        )
        
        result = MatchingService.calculate_match_score(self.student.id, self.offer.id)
        self.assertEqual(result['total_score'], 100.0)
        self.assertEqual(result['breakdown']['speciality'], 100.0)
        self.assertEqual(result['breakdown']['skills'], 100.0)
        self.assertEqual(result['breakdown']['challenges'], 100.0)
        self.assertEqual(result['breakdown']['location'], 100.0)
