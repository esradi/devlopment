import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, Company

def create_test_company():
    email = "test@company.com"
    password = "password123"
    username = "testcompany"

    # Check if user exists
    if not User.objects.filter(email=email).exists():
        # Create the user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role='company',
            first_name="Alice",
            last_name="Manager"
        )
        user.email_verified = True
        user.save()

        # Create the company profile
        Company.objects.create(
            user=user,
            company_name="Aero Dynamic Tech",
            industry="Software & AI",
            city="Algiers",
            country="Algeria",
            verification_status='verified',
            description="Leading AI solutions provider in North Africa."
        )
        
        print("\n" + "="*50)
        print("SUCCESS: Test Company Account Created")
        print("="*50)
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"Role: Company")
        print("="*50 + "\n")
    else:
        print(f"\n[!] User with email {email} already exists.\n")

if __name__ == "__main__":
    create_test_company()
