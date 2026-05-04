import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.offers.models import Offer, Application
from apps.accounts.models import Student, StudentSkill
from apps.matching.services import MatchingService

print("=== OFFER DATA ===")
for o in Offer.objects.filter(status='active'):
    domains = list(o.domains.values_list('name', flat=True))
    skills = list(o.skills.values_list('name', flat=True))
    print(f"Offer {o.id}: {o.title} | wilaya={o.wilaya} | domains={domains} | skills={skills}")

print("\n=== STUDENT DATA ===")
for s in Student.objects.all():
    sk_count = StudentSkill.objects.filter(student=s).count()
    ver_count = StudentSkill.objects.filter(student=s, is_verified=True).count()
    print(f"Student {s.id} ({s.user.get_full_name()}): domain={s.domain}, spec={s.speciality}, wilaya={s.wilaya}, skills={sk_count}, verified={ver_count}")

print("\n=== LIVE MATCH SCORES (Applications) ===")
for app in Application.objects.all()[:15]:
    try:
        result = MatchingService.calculate_match_score(app.student_id, app.offer_id)
        print(f"App {app.id}: Student {app.student_id} <> Offer {app.offer_id} => {result['total_score']} | breakdown={result['breakdown']}")
    except Exception as e:
        print(f"App {app.id}: ERROR {e}")
