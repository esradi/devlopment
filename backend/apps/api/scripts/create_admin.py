import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.api.models import User

def create_admin():
    email = 'admin@stagio.com'
    password = 'adminpassword123'
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            username=email,
            password=password,
            role='admin'
        )
        print(f"Superuser created: {email} / {password}")
    else:
        print(f"Superuser {email} already exists.")

if __name__ == "__main__":
    create_admin()
