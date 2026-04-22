from django.contrib.auth import get_user_model
User = get_user_model()
from apps.accounts.models import Student

print("\n--- Seeding Test Student ---")

# Check if user exists
user = User.objects.filter(email='student2@test.com').first()
if not user:
    user = User.objects.create_user(
        email='student2@test.com',
        username='student2',
        password='password123',
        first_name='Ali',
        last_name='Student',
        role='student'
    )
    print("User 'student2@test.com' created (pass: password123)")

# Check if Student profile exists
if not Student.objects.filter(user=user).exists():
    Student.objects.create(
        user=user,
        university="University of Bab Ezzouar",
        domain="Technology",
        speciality="Computer Science",
        academic_year="Master 2",
        profile_completeness=85
    )
    print("Student profile linked to 'student2@test.com'.\n")
else:
    print("Student profile already exists.\n")
