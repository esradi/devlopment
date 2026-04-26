from django.db import models
from apps.accounts.models import Company
from apps.offers.models import Application

class CompanyDocument(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50) # 'nif', 'registre_commerce', 'other'
    file = models.FileField(upload_to='company_documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'api_companydocument'

    def __str__(self):
        return f"{self.company.company_name} - {self.document_type}"

class Interview(models.Model):
    STATUS_CHOICES = [
        ('pending_student_selection', 'Pending Student Selection'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]
    TYPE_CHOICES = [
        ('video', 'Video Call'),
        ('phone', 'Phone Call'),
        ('in_person', 'In Person'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='interviews')
    
    proposed_spot_1 = models.DateTimeField(null=True, blank=True)
    proposed_spot_2 = models.DateTimeField(null=True, blank=True)
    proposed_spot_3 = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    
    duration_minutes = models.IntegerField(default=30)
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    meeting_link = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True) # for in-person
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending_student_selection')
    feedback = models.TextField(blank=True, null=True)
    score = models.IntegerField(null=True, blank=True) # e.g., 1-10
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'api_interview'
        ordering = ['scheduled_at']

    def __str__(self):
        return f"Interview for {self.application.student.user.get_full_name()} at {self.scheduled_at}"

from django.conf import settings

class CompanyTeamMember(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_membership')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='team_members')
    role = models.CharField(max_length=50, default='recruiter') # admin, recruiter, viewer
    
    can_create_offers = models.BooleanField(default=True)
    can_edit_offers = models.BooleanField(default=True)
    can_delete_offers = models.BooleanField(default=False)
    can_view_applications = models.BooleanField(default=True)
    can_accept_applications = models.BooleanField(default=True)
    can_refuse_applications = models.BooleanField(default=True)
    can_sign_conventions = models.BooleanField(default=False)
    can_invite_team_members = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'api_companyteammember'

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} - {self.company.company_name} ({self.role})"
