import os
import django
from django.utils import timezone
from datetime import timedelta
import random

def run():
    from apps.accounts.models import User, Company
    from apps.offers.models import Offer, Location, OfferType, DurationOption
    from apps.specialities.models import Domain, Skill

    # 1. Setup Base Data
    print("Setting up base data...")
    domains = ['Computer Science', 'Telecommunications', 'Mechanical Engineering', 'Business & Marketing', 'Data Science']
    db_domains = [Domain.objects.get_or_create(name=d)[0] for d in domains]

    skills = ['Python', 'React', 'Java', 'Machine Learning', 'AutoCAD', 'Marketing Strategy', 'Network Security', 'Django', 'SQL']
    db_skills = [Skill.objects.get_or_create(name=s)[0] for s in skills]

    locations = ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Setif']
    db_locations = [Location.objects.get_or_create(name=l)[0] for l in locations]

    types = ['PFE', 'Summer Internship', 'Part-time', 'Full-time']
    db_types = [OfferType.objects.get_or_create(name=t)[0] for t in types]

    durations = [1, 2, 3, 6, 12]
    db_durations = [DurationOption.objects.get_or_create(months=d)[0] for d in durations]

    # 2. Algerian Companies
    companies_data = [
        {
            "name": "Yassir",
            "industry": "Tech / Mobility",
            "city": "Algiers",
            "desc": "Leading super-app in the Maghreb offering ride-hailing and delivery services.",
            "email": "careers@yassir.com"
        },
        {
            "name": "Sonatrach",
            "industry": "Oil & Gas",
            "city": "Algiers",
            "desc": "The largest oil and gas company in Africa, driving the Algerian economy.",
            "email": "stage@sonatrach.dz"
        },
        {
            "name": "Djezzy",
            "industry": "Telecommunications",
            "city": "Algiers",
            "desc": "Algeria's leading mobile network operator.",
            "email": "recrutement@djezzy.dz"
        },
        {
            "name": "Cevital",
            "industry": "Agri-Food",
            "city": "Bejaia",
            "desc": "The largest private conglomerate in Algeria.",
            "email": "contact@cevital.com"
        },
        {
            "name": "Ouedkniss",
            "industry": "E-commerce",
            "city": "Algiers",
            "desc": "The #1 e-commerce and classifieds platform in Algeria.",
            "email": "jobs@ouedkniss.com"
        }
    ]

    print("Creating Algerian companies and users...")
    db_companies = []
    for c in companies_data:
        # Create User
        user, created = User.objects.get_or_create(
            email=c['email'],
            defaults={
                'username': c['email'],
                'first_name': 'HR',
                'last_name': c['name'],
                'role': 'company',
                'is_active': True
            }
        )
        if created:
            user.set_password('stageio2026')
            user.save()

        # Create Company Profile
        company, _ = Company.objects.get_or_create(
            user=user,
            defaults={
                'company_name': c['name'],
                'industry': c['industry'],
                'city': c['city'],
                'country': 'Algeria',
                'description': c['desc']
            }
        )
        db_companies.append(company)

    # 3. Realistic Offers
    print("Creating realistic Algerian PFE & Internship offers...")
    offers_data = [
        {
            "company": "Yassir",
            "title": "Backend Engineering Intern (Django/Python)",
            "desc": "Join our core engineering team to build scalable APIs for our delivery services. You will learn best practices in microservices architecture and high-availability systems.",
            "domain": "Computer Science",
            "type": "Summer Internship",
            "wilaya": "Algiers",
            "duration": 3
        },
        {
            "company": "Sonatrach",
            "title": "PFE: Predictive Maintenance using Machine Learning",
            "desc": "Apply your Data Science skills to build a predictive model for oil rig maintenance. This is a crucial PFE project offering access to real industrial data.",
            "domain": "Data Science",
            "type": "PFE",
            "wilaya": "Hassi Messaoud",
            "duration": 6
        },
        {
            "company": "Djezzy",
            "title": "Telecommunications Network Optimization Intern",
            "desc": "Work with our radio engineers to optimize 4G network coverage in the Constantine region using advanced simulation tools.",
            "domain": "Telecommunications",
            "type": "PFE",
            "wilaya": "Constantine",
            "duration": 6
        },
        {
            "company": "Ouedkniss",
            "title": "Frontend Developer Intern (React.js)",
            "desc": "Help modernize the UI of Algeria's biggest website. You will work directly with our UX team to implement responsive designs.",
            "domain": "Computer Science",
            "type": "Summer Internship",
            "wilaya": "Algiers",
            "duration": 2
        },
        {
            "company": "Cevital",
            "title": "Supply Chain Management PFE",
            "desc": "Analyze and optimize the logistics network for our agri-food distribution across eastern Algeria.",
            "domain": "Business & Marketing",
            "type": "PFE",
            "wilaya": "Bejaia",
            "duration": 6
        }
    ]

    for o in offers_data:
        company = next(c for c in db_companies if c.company_name == o['company'])
        offer, created = Offer.objects.get_or_create(
            company=company,
            title=o['title'],
            defaults={
                'description': o['desc'],
                'wilaya': o['wilaya'],
                'status': 'active',
                'deadline': timezone.now() + timedelta(days=30)
            }
        )
        
        if created:
            # Add relationships
            dom = Domain.objects.filter(name=o['domain']).first()
            if dom: offer.domains.add(dom)
            
            typ = OfferType.objects.filter(name=o['type']).first()
            if typ: offer.offer_types.add(typ)
            
            dur = DurationOption.objects.filter(months=o['duration']).first()
            if dur: offer.durations.add(dur)
            
            # Add random skills
            random_skills = random.sample(db_skills, 3)
            offer.skills.add(*random_skills)
            
            offer.save()

    print("Success! Database seeded with 5 top Algerian companies and their internship offers.")

if __name__ == '__main__':
    run()
