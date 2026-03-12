from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from .models import Domain, Speciality, Competency

User = get_user_model()


class SpecialitiesAPITests(TestCase):
    def setUp(self):
        # create API client and users
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com', username='admin', password='adminpass', role='admin'
        )
        self.student_user = User.objects.create_user(
            email='stu@test.com', username='stu', password='stupass', role='student'
        )

    def test_domains_list_initially_empty(self):
        resp = self.client.get('/api/specialities/domains/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json(), [])

    def test_create_domain_requires_admin(self):
        # anonymous
        resp = self.client.post('/api/specialities/domains/', {'name': 'CS'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # student
        self.client.force_authenticate(self.student_user)
        resp = self.client.post('/api/specialities/domains/', {'name': 'CS'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # admin
        self.client.force_authenticate(self.admin_user)
        resp = self.client.post('/api/specialities/domains/', {'name': 'CS'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Domain.objects.count(), 1)

    def test_speciality_endpoints(self):
        # prepare domain
        domain = Domain.objects.create(name='Engineering')

        # list empty
        resp = self.client.get('/api/specialities/specialities/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json(), [])

        # non-admin cannot create
        self.client.force_authenticate(self.student_user)
        resp = self.client.post('/api/specialities/specialities/', {'name': 'Software', 'domain': domain.id})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # admin create
        self.client.force_authenticate(self.admin_user)
        resp = self.client.post('/api/specialities/specialities/', {'name': 'Software', 'domain': domain.id})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Speciality.objects.count(), 1)

        # verify list and by-domain
        resp = self.client.get('/api/specialities/specialities/')
        self.assertEqual(len(resp.json()), 1)

        resp = self.client.get(f'/api/specialities/domains/{domain.id}/specialities/')
        self.assertEqual(len(resp.json()), 1)

    def test_competency_endpoints(self):
        domain = Domain.objects.create(name='Health')
        spec = Speciality.objects.create(name='Nursing', domain=domain)

        # list/filter empty
        resp = self.client.get('/api/specialities/competencies/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.json(), [])

        # student cannot create
        self.client.force_authenticate(self.student_user)
        resp = self.client.post('/api/specialities/competencies/', {'name': 'First Aid', 'speciality': spec.id})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        # admin create
        self.client.force_authenticate(self.admin_user)
        resp = self.client.post('/api/specialities/competencies/', {'name': 'First Aid', 'speciality': spec.id})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Competency.objects.count(), 1)

        # by-speciality
        resp = self.client.get(f'/api/specialities/specialities/{spec.id}/competencies/')
        self.assertEqual(len(resp.json()), 1)

        # filter by domain
        resp = self.client.get(f'/api/specialities/competencies/?domain={domain.id}')
        self.assertEqual(len(resp.json()), 1)

