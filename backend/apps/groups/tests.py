from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from .models import StudyGroup, StudyGroupMember, GroupMessage, GroupResource
from apps.accounts.models import Student
from apps.specialities.models import Domain, Speciality

User = get_user_model()


class StudyGroupTests(APITestCase):
    """Test Study Group endpoints"""

    @classmethod
    def setUpTestData(cls):
        # Create domain and speciality
        cls.domain = Domain.objects.create(name="Computer Science")
        cls.speciality = Speciality.objects.create(
            name="Python Development",
            domain=cls.domain
        )

    def setUp(self):
        # Create test users
        self.student1_user = User.objects.create_user(
            email="student1@test.com",
            username="student1",
            password="testpass123",
            role="student"
        )
        self.student1 = Student.objects.create(
            user=self.student1_user,
            domain=self.domain,
            speciality=self.speciality
        )

        self.student2_user = User.objects.create_user(
            email="student2@test.com",
            username="student2",
            password="testpass123",
            role="student"
        )
        self.student2 = Student.objects.create(
            user=self.student2_user,
            domain=self.domain,
            speciality=self.speciality
        )

        self.client = APIClient()

    def test_list_groups_unauthenticated(self):
        """Unauthenticated users cannot list groups"""
        response = self.client.get('/api/groups/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_group(self):
        """Authenticated student can create a group"""
        self.client.force_authenticate(user=self.student1_user)
        data = {
            'name': 'Python Study Group',
            'description': 'Learning Python together',
            'domain': self.domain.id,
            'speciality': self.speciality.id,
            'topic': 'OOP'
        }
        response = self.client.post('/api/groups/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Python Study Group')
        self.assertEqual(response.data['creator'], self.student1_user.id)

    def test_list_my_groups(self):
        """Student can list their groups"""
        # Create a group
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        # Add student as member
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.get('/api/groups/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['my_groups']), 1)
        self.assertEqual(response.data['my_groups'][0]['name'], 'Test Group')

    def test_join_group(self):
        """Student can join a group"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )

        self.client.force_authenticate(user=self.student2_user)
        response = self.client.post(f'/api/groups/{group.id}/join/', {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify membership
        self.assertTrue(
            StudyGroupMember.objects.filter(
                group=group,
                student=self.student2
            ).exists()
        )

    def test_join_group_already_member(self):
        """Student cannot join if already a member"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.post(f'/api/groups/{group.id}/join/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_group_full(self):
        """Student cannot join a full group (8 members)"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )

        # Fill the group with 8 members
        for i in range(7):
            user = User.objects.create_user(
                email=f"student{i+3}@test.com",
                username=f"student{i+3}",
                password="testpass123",
                role="student"
            )
            student = Student.objects.create(
                user=user,
                domain=self.domain,
                speciality=self.speciality
            )
            StudyGroupMember.objects.create(group=group, student=student)

        # Add first student as creator/member
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student2_user)
        response = self.client.post(f'/api/groups/{group.id}/join/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('full', response.data['detail'].lower())

    def test_leave_group(self):
        """Student can leave a group"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student2)

        self.client.force_authenticate(user=self.student2_user)
        response = self.client.post(f'/api/groups/{group.id}/leave/', {})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify no longer a member
        self.assertFalse(
            StudyGroupMember.objects.filter(
                group=group,
                student=self.student2
            ).exists()
        )

    def test_creator_cannot_leave(self):
        """Group creator cannot leave (must delete instead)"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.post(f'/api/groups/{group.id}/leave/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_group_by_creator(self):
        """Only creator can delete a group"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.delete(f'/api/groups/{group.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify group deleted
        self.assertFalse(StudyGroup.objects.filter(id=group.id).exists())

    def test_non_creator_cannot_delete(self):
        """Non-creator cannot delete group"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )

        self.client.force_authenticate(user=self.student2_user)
        response = self.client.delete(f'/api/groups/{group.id}/delete/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_send_message_as_member(self):
        """Group member can send a message"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student1_user)
        data = {'content': 'Hello everyone!'}
        response = self.client.post(f'/api/groups/{group.id}/messages/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Hello everyone!')

    def test_send_message_as_non_member(self):
        """Non-member cannot send a message"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )

        self.client.force_authenticate(user=self.student2_user)
        data = {'content': 'Hello everyone!'}
        response = self.client.post(f'/api/groups/{group.id}/messages/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_message_history(self):
        """Group member can retrieve message history"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        # Create some messages
        for i in range(3):
            GroupMessage.objects.create(
                group=group,
                sender=self.student1_user,
                content=f'Message {i+1}'
            )

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.get(f'/api/groups/{group.id}/messages/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)

    def test_share_resource(self):
        """Group member can share a resource"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student1_user)
        from django.core.files.uploadedfile import SimpleUploadedFile
        file_content = b"fake pdf content"
        uploaded_file = SimpleUploadedFile("tutorial.pdf", file_content, content_type="application/pdf")
        
        data = {
            'title': 'Python Tutorial',
            'file': uploaded_file
        }
        response = self.client.post(f'/api/groups/{group.id}/resources/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Python Tutorial')

    def test_get_resources(self):
        """Group member can retrieve shared resources"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        # Create a resource
        GroupResource.objects.create(
            group=group,
            uploaded_by=self.student1_user,
            title='Python Tutorial',
            file='https://example.com/python-tutorial.pdf'
        )

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.get(f'/api/groups/{group.id}/resources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Python Tutorial')

    def test_get_group_details(self):
        """Can retrieve group details including member count"""
        group = StudyGroup.objects.create(
            name='Test Group',
            description='Test Description',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)
        StudyGroupMember.objects.create(group=group, student=self.student2)

        self.client.force_authenticate(user=self.student1_user)
        response = self.client.get(f'/api/groups/{group.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Group')
        self.assertEqual(response.data['member_count'], 2)
        self.assertTrue(response.data['is_member'])

    def test_suggested_groups(self):
        """User sees suggested groups in same speciality with available space"""
        group = StudyGroup.objects.create(
            name='Test Group',
            domain=self.domain,
            speciality=self.speciality,
            creator=self.student1_user
        )
        StudyGroupMember.objects.create(group=group, student=self.student1)

        self.client.force_authenticate(user=self.student2_user)
        response = self.client.get('/api/groups/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['suggested_groups']), 1)
        self.assertEqual(response.data['suggested_groups'][0]['name'], 'Test Group')
