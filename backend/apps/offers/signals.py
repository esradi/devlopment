from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Application


@receiver(post_save, sender=Application)
def create_internship_validation(sender, instance, created, **kwargs):
    if created:
        from apps.admin_panel.models import InternshipValidation
        InternshipValidation.objects.get_or_create(application=instance)
