from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Application


@receiver(post_save, sender=Application)
def create_internship_validation(sender, instance, created, **kwargs):
    """
    Automatically create an InternshipValidation record whenever a new
    Application is saved for the first time.
    """
    if created:
        # Import here to avoid circular imports
        from apps.admin_panel.models import InternshipValidation
        InternshipValidation.objects.get_or_create(application=instance)
