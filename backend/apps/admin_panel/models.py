from django.db import models
from django.conf import settings

class InternshipValidation(models.Model):
    """Admin validation/approval of a student's internship application"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    application = models.OneToOneField('offers.Application', on_delete=models.CASCADE, related_name='validation')
    validated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='validations_done')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    feedback = models.TextField(blank=True, null=True, help_text="Reason for rejection or additional notes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_internshipvalidation'

    def __str__(self):
        return f"Validation: {self.application} - {self.status}"
