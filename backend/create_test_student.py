import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, Student

def create_test_student():
    email = "test@student.com"
    password = "password123"
    username = "teststudent"

    if not User.objects.filter(email=email).exists():
        # Create the user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role='student',
            first_name="Jane",
            last_name="Doe",
            email_verified=True
        )

        # Create the student profile
        Student.objects.create(
            user=user,
            university="University of Algiers",
            domain="Computer Science",
            speciality="Artificial Intelligence",
            academic_year="L3",
            wilaya="Algiers",
            profile_completeness=60
        )
        
        print("\n" + "="*50)
        print("SUCCESS: Test Student Account Created")
        print("="*50)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Role: Student")
        print("="*50 + "\n")
    else:
        print(f"\n[!] User with email {email} already exists.\n")

if __name__ == "__main__":
    create_test_student()
