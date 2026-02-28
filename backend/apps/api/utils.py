import random
import string
from django.core.mail import send_mail
from django.conf import settings

def generate_verification_code():
    """Generate a random 6-digit numeric code."""
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(email, code):
    """Send verification code via email."""
    subject = 'Your Verification Code'
    message = f'Your 6-digit verification code is: {code}'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False

def send_password_reset_email(email, token):
    """Send password reset link/code."""
    subject = 'Password Reset Request'
    message = f'Your password reset token is: {token}'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
