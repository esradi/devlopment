from django.db import models
from django.conf import settings

class InternshipValidation(models.Model):
    #Admin validation/approval of a student's internship application
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

class AdminActionLog(models.Model):
    # Tracks sensitive administrative actions for system history
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=50) 
    target_model = models.CharField(max_length=100, help_text="The model name (e.g., user, internshipvalidation)")
    target_id = models.CharField(max_length=50, help_text="ID of the object acted upon")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, help_text="Before/After states or additional details")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_adminactionlog'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action_type} on {self.target_model}:{self.target_id} at {self.timestamp}"
