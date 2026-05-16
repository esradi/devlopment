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
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        raise e  # NEW: Raise the exception so the serializer can catch it and show it on the frontend

def send_password_reset_email(email, token):
    """Send password reset link/code."""
    subject = 'Password Reset Request'
    message = f'Your password reset token is: {token}'
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False

def send_team_invite_email(email, company_name, temp_password):
    """Send an invitation email to a new team member with their temporary password."""
    subject = f'You have been invited to join {company_name} on Stage-IO!'
    message = (
        f"You have been invited to manage recruitment for {company_name} on Stage-IO!\n\n"
        f"Your login email: {email}\n"
        f"Your temporary password: {temp_password}\n\n"
        "Please log in to the platform and change your password immediately."
    )
    email_from = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    try:
        send_mail(subject, message, email_from, recipient_list, fail_silently=False)
        return True
    except Exception as e:
        print(f"Error sending team invite email: {e}")
        return False
