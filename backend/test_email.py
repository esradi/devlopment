import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_smtp():
    print(f"Testing SMTP for: {settings.EMAIL_HOST_USER}")
    print(f"Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
    print(f"Using TLS: {settings.EMAIL_USE_TLS}")
    
    try:
        send_mail(
            'SMTP Diagnostic Test',
            'This is a test email from your Django portal.',
            settings.EMAIL_HOST_USER,
            [settings.EMAIL_HOST_USER], # send to yourself
            fail_silently=False,
        )
        print("\n✅ SUCCESS! The email was sent. Please check your inbox.")
    except Exception as e:
        print("\n❌ FAILED to send email.")
        print(f"Error Detail: {e}")
        if "Username and Password not accepted" in str(e):
            print("\n💡 REASON: Google rejected your password. This is because you must use a '16-character App Password' instead of your regular password.")

if __name__ == "__main__":
    test_smtp()
