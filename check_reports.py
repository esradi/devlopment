import os, sys, django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.accounts.models import Student, Company, User
from apps.offers.models import Application, Offer
from apps.conventions.models import Convention
from django.db.models import Count, Q

print("=== DB GROUND TRUTH ===")
print(f"Students:           {Student.objects.count()}")
print(f"Companies:          {Company.objects.count()}")
print(f"Active Offers:      {Offer.objects.filter(status='active').count()}")
print(f"Total Applications: {Application.objects.count()}")
print(f"Accepted Apps:      {Application.objects.filter(status='accepted').count()}")
print(f"Pending Apps:       {Application.objects.filter(status='pending').count()}")

print()
print("=== CONVENTIONS ===")
print(f"Total:                     {Convention.objects.count()}")
print(f"pending_admin_validation:  {Convention.objects.filter(status='pending_admin_validation').count()}")
pending_partner = Convention.objects.filter(
    status__in=['pending_student_signature', 'pending_company_signature']
).count()
print(f"in_progress (both):        {pending_partner}")
print(f"validated:                 {Convention.objects.filter(status='validated').count()}")
print(f"All 3 signed:              {Convention.objects.filter(student_signed=True, company_signed=True, admin_signed=True).count()}")

print()
print("=== PENDING ACTIONS ===")
print(f"Pending company verif:  {Company.objects.filter(verification_status='pending').count()}")
pending_ids = User.objects.filter(role='student', id_verified=False).exclude(
    Q(national_id_card='') | Q(national_id_card__isnull=True)
).count()
print(f"Pending student IDs:    {pending_ids}")

print()
print("=== FUNNEL ===")
print(f"Registered students:    {Student.objects.count()}")
print(f"Applied (distinct):     {Application.objects.values('student').distinct().count()}")
print(f"Accepted (distinct):    {Application.objects.filter(status='accepted').values('student').distinct().count()}")
print(f"Convention signed x3:  {Convention.objects.filter(student_signed=True, company_signed=True, admin_signed=True).count()}")

print()
print("=== SPECIALITIES (top 5) ===")
from apps.offers.models import Application as App
specs = App.objects.values('offer__domains__name').annotate(applications=Count('id')).order_by('-applications')[:5]
for s in specs:
    print(f"  {s['offer__domains__name'] or 'None'}: {s['applications']}")

print()
print("=== PLACEMENT RATE CALC ===")
students = Student.objects.count()
accepted = Application.objects.filter(status='accepted').count()
rate = round((accepted / students) * 100) if students > 0 else 0
print(f"  {accepted} accepted / {students} students = {rate}%")

conv_total = Convention.objects.count()
conv_valid = Convention.objects.filter(status='validated').count()
conv_rate  = round((conv_valid / conv_total) * 100) if conv_total > 0 else 0
print(f"  {conv_valid} validated / {conv_total} conventions = {conv_rate}%")
