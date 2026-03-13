from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ('application_submitted', 'Application Submitted'),
        ('application_viewed', 'Application Viewed'),
        ('application_accepted', 'Application Accepted'),
        ('application_refused', 'Application Refused'),
        ('interview_proposed', 'Interview Proposed'),
        ('interview_confirmed', 'Interview Confirmed'),
        ('interview_cancelled', 'Interview Cancelled'),
        ('interview_reminder_24h', 'Interview Reminder 24h'),
        ('interview_reminder_1h', 'Interview Reminder 1h'),
        ('convention_generated', 'Convention Generated'),
        ('convention_student_signed', 'Convention Student Signed'),
        ('convention_company_signed', 'Convention Company Signed'),
        ('convention_validated', 'Convention Validated'),
        ('convention_rejected', 'Convention Rejected'),
        ('skill_verified', 'Skill Verified'),
        ('challenge_passed', 'Challenge Passed'),
        ('new_message', 'New Message'),
        ('company_validated', 'Company Validated'),
        ('offer_recommendation', 'Offer Recommendation'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    action_url = models.CharField(max_length=500, blank=True, null=True)
    action_text = models.CharField(max_length=100, blank=True, null=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    
    related_object_type = models.CharField(max_length=100, blank=True, null=True)
    related_object_id = models.IntegerField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_notification'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.title} ({'Read' if self.is_read else 'Unread'})"
