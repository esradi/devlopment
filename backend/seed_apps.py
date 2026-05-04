
import os
import django
import random

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Student
from apps.offers.models import Offer, Application
from apps.conventions.models import Convention
from django.utils import timezone

User = get_user_model()

def seed_realistic_data():
    students = list(Student.objects.all())
    offers = list(Offer.objects.all())
    
    if not students or not offers:
        print("Not enough students or offers to seed data.")
        return

    print(f"Syncing and populating realistic data... (Current Apps: {Application.objects.count()})")
    
    statuses = ['pending', 'accepted', 'university_approved', 'rejected']
    
    count = 0
    for _ in range(30):
        student = random.choice(students)
        offer = random.choice(offers)
        
        if Application.objects.filter(student=student, offer=offer).exists():
            continue
            
        status = random.choice(statuses)
        app = Application.objects.create(
            student=student,
            offer=offer,
            company=offer.company,
            status=status,
            cover_letter="I am very motivated for this internship position.",
            created_at=timezone.now() - timezone.timedelta(days=random.randint(1, 30))
        )
        
        # If it's university_approved or accepted, maybe create a convention
        if status in ['university_approved']:
            conv = Convention.objects.create(
                application=app,
                student=student,
                company=offer.company,
                offer=offer,
                internship_title=offer.title,
                status='pending_admin_validation' if random.random() > 0.5 else 'validated',
                start_date=timezone.now().date() + timezone.timedelta(days=10),
                end_date=timezone.now().date() + timezone.timedelta(days=100),
                admin_signed=True if random.random() > 0.5 else False
            )
            if conv.status == 'validated':
                conv.admin_signed = True
                conv.student_signed = True
                conv.company_signed = True
                conv.save()
                
        count += 1
        if count >= 20: break
    
    print(f"Successfully added {count} diverse applications with conventions.")

if __name__ == "__main__":
    seed_realistic_data()
