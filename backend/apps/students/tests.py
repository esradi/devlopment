from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.accounts.models import Student, StudentSkill
from apps.offers.models import Skill

User = get_user_model()


class StudentCompetenciesAPITests(TestCase):
    def setUp(self):
        """Create a test user, student, and skills"""
        self.user = User.objects.create_user(
            email='student@test.com',
            username='student@test.com',
            password='testpass123',
            role='student'
        )
        self.student = Student.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            domain='IT',
            speciality='Python'
        )
        
        # Create test skills
        self.skill_python = Skill.objects.create(name='Python')
        self.skill_django = Skill.objects.create(name='Django')
        self.skill_javascript = Skill.objects.create(name='JavaScript')
        
        # Assign verified skill to student
        self.verified_skill = StudentSkill.objects.create(
            student=self.student,
            skill=self.skill_python,
            is_verified=True
        )
        
        # Assign unverified skill to student
        self.unverified_skill = StudentSkill.objects.create(
            student=self.student,
            skill=self.skill_django,
            is_verified=False
        )
        
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_get_student_competencies_success(self):
        """Test GET /student/competencies/ returns all student's skills"""
        response = self.client.get('/api/student/competencies/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('competencies', response.data)
        self.assertEqual(len(response.data['competencies']), 2)

    def test_competencies_include_skill_details(self):
        """Test that competencies include full skill information"""
        response = self.client.get('/api/student/competencies/')
        self.assertEqual(response.status_code, 200)
        competencies = response.data['competencies']
        
        # Check that skill details are included
        self.assertTrue(all('skill' in c for c in competencies))
        self.assertTrue(all('is_verified' in c for c in competencies))
        
        # Check skill names are correct
        skill_names = [c['skill']['name'] for c in competencies]
        self.assertIn('Python', skill_names)
        self.assertIn('Django', skill_names)

    def test_competencies_verification_status(self):
        """Test that competencies show correct verification status"""
        response = self.client.get('/api/student/competencies/')
        self.assertEqual(response.status_code, 200)
        competencies = response.data['competencies']
        
        verified_count = sum(1 for c in competencies if c['is_verified'])
        unverified_count = sum(1 for c in competencies if not c['is_verified'])
        
        self.assertEqual(verified_count, 1)
        self.assertEqual(unverified_count, 1)

    def test_get_competencies_no_skills(self):
        """Test GET /student/competencies/ when student has no skills"""
        new_user = User.objects.create_user(
            email='newstudent@test.com',
            username='newstudent@test.com',
            password='testpass123',
            role='student'
        )
        new_student = Student.objects.create(
            user=new_user,
            first_name='Jane',
            last_name='Smith'
        )
        
        self.client.force_authenticate(user=new_user)
        response = self.client.get('/api/student/competencies/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['competencies']), 0)

    def test_get_competencies_unauthenticated(self):
        """Test GET /student/competencies/ without authentication fails"""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/student/competencies/')
        self.assertEqual(response.status_code, 401)

    def test_get_competencies_non_student_user(self):
        """Test GET /student/competencies/ fails for non-student users"""
        company_user = User.objects.create_user(
            email='company@test.com',
            username='company@test.com',
            password='testpass123',
            role='company'
        )
        
        self.client.force_authenticate(user=company_user)
        response = self.client.get('/api/student/competencies/')
        self.assertEqual(response.status_code, 403)

    # POST Tests for adding competencies
    def test_post_add_skill_success(self):
        """Test adding a new skill to student's competencies"""
        payload = {'skill_id': self.skill_javascript.id}
        response = self.client.post('/api/student/competencies/', payload)
        
        self.assertEqual(response.status_code, 201)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Skill added successfully')
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['skill']['id'], self.skill_javascript.id)

    def test_post_add_skill_missing_skill_id(self):
        """Test POST fails when skill_id is missing"""
        payload = {}
        response = self.client.post('/api/student/competencies/', payload)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_post_add_duplicate_skill(self):
        """Test POST fails when student already has the skill"""
        # Try to add Python again (already in setUp)
        payload = {'skill_id': self.skill_python.id}
        response = self.client.post('/api/student/competencies/', payload)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
        self.assertIn('already has this skill', response.data['error'])

    def test_post_add_skill_invalid_skill_id(self):
        """Test POST fails with invalid skill_id"""
        payload = {'skill_id': 99999}  # Non-existent skill ID
        response = self.client.post('/api/student/competencies/', payload)
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('errors', response.data)

    def test_post_add_skill_creates_unverified(self):
        """Test that newly added skills are unverified"""
        payload = {'skill_id': self.skill_javascript.id}
        response = self.client.post('/api/student/competencies/', payload)
        
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data['data']['is_verified'])

    # GET Detail Tests
    def test_get_competency_detail_success(self):
        """Test retrieving details of a specific competency"""
        competency_id = self.verified_skill.id
        response = self.client.get(f'/api/student/competencies/{competency_id}/')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['skill']['name'], 'Python')
        self.assertTrue(response.data['is_verified'])

    def test_get_competency_detail_not_found(self):
        """Test GET detail returns 404 for non-existent competency"""
        response = self.client.get('/api/student/competencies/99999/')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)

    # DELETE Tests
    def test_delete_competency_success(self):
        """Test successfully deleting a competency"""
        competency_id = self.verified_skill.id
        response = self.client.delete(f'/api/student/competencies/{competency_id}/')
        
        self.assertEqual(response.status_code, 204)
        # Verify it's actually deleted
        self.assertFalse(StudentSkill.objects.filter(id=competency_id).exists())

    def test_delete_competency_not_found(self):
        """Test DELETE returns 404 for non-existent competency"""
        response = self.client.delete('/api/student/competencies/99999/')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.data)

    def test_delete_another_students_competency(self):
        """Test cannot delete another student's competency"""
        other_user = User.objects.create_user(
            email='other@test.com',
            username='other@test.com',
            password='testpass123',
            role='student'
        )
        other_student = Student.objects.create(
            user=other_user,
            first_name='Other',
            last_name='Student'
        )
        
        # Create a skill for the other student
        other_skill = StudentSkill.objects.create(
            student=other_student,
            skill=self.skill_python,
            is_verified=False
        )
        
        # Try to delete other student's skill with current authenticated client
        response = self.client.delete(f'/api/student/competencies/{other_skill.id}/')
        
        self.assertEqual(response.status_code, 404)
        # Verify the skill was NOT deleted
        self.assertTrue(StudentSkill.objects.filter(id=other_skill.id).exists())
