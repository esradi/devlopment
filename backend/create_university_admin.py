import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, AdminProfile

def create_admin():
    email = "university@test.com"
    password = "password123"
    
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            role='admin',
            email_verified=True
        )
        AdminProfile.objects.create(
            user=user,
            admin_role="Dean of University"
        )
        print(f"Created admin: {email} / {password}")
    else:
        print(f"Admin {email} already exists")

if __name__ == "__main__":
    create_admin()
