from django.core.management.base import BaseCommand
from apps.challenges.services.generator_service import seed_all_challenges
import json

class Command(BaseCommand):
    help = 'Seed AI-generated challenges for specialities'

    def add_arguments(self, parser):
        parser.add_argument(
            '--speciality',
            type=str,
            help='Filter by a specific speciality name',
        )

    def handle(self, *args, **options):
        speciality = options.get('speciality')
        
        if speciality:
            self.stdout.write(self.style.NOTICE(f"Seeding challenges for: {speciality}"))
        else:
            self.stdout.write(self.style.NOTICE("Seeding challenges for ALL specialities..."))

        results = seed_all_challenges(speciality_filter=speciality)
        
        created = [r for r in results if r.get("status") == "created"]
        skipped = [r for r in results if "skipped" in r.get("status", "")]
        errors  = [r for r in results if "error" in r.get("status", "")]

        self.stdout.write(self.style.SUCCESS(f"Done! Created: {len(created)}, Skipped: {len(skipped)}, Errors: {len(errors)}"))
        
        if errors:
            self.stdout.write(self.style.ERROR("\nErrors encountered:"))
            for err in errors:
                self.stdout.write(f"- {err.get('skill')}: {err.get('error')}")
