from django.db import models

class Convention(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_student_signature', 'Pending Student'),
        ('pending_company_signature', 'Pending Company'),
        ('pending_admin_validation', 'Pending Admin'),
        ('validated', 'Validated'),
        ('rejected', 'Rejected'),
    ]
    
    # Core Relations
    application = models.OneToOneField('offers.Application', on_delete=models.CASCADE, related_name='convention', null=True, blank=True)
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='conventions')
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='conventions')
    offer = models.ForeignKey('offers.Offer', on_delete=models.CASCADE, related_name='conventions')
    
    # Internship Details
    internship_title = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    duration_months = models.IntegerField(default=1)
    supervisor_name = models.CharField(max_length=100, blank=True)
    supervisor_email = models.EmailField(blank=True)
    tasks = models.JSONField(blank=True, null=True)  # List of tasks
    compensation = models.CharField(max_length=50, blank=True)
    compensation_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Workflow Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    
    # Signature Tracking: Student
    student_signed = models.BooleanField(default=False)
    student_signed_at = models.DateTimeField(null=True, blank=True)
    student_fingerprint_authenticated = models.BooleanField(default=False)
    student_authentication_timestamp = models.CharField(max_length=100, blank=True)
    student_credential_id = models.CharField(max_length=255, blank=True)
    student_ip_address = models.GenericIPAddressField(null=True, blank=True)
    student_user_agent = models.TextField(blank=True)
    
    # Signature Tracking: Company
    company_signed = models.BooleanField(default=False)
    company_signed_at = models.DateTimeField(null=True, blank=True)
    company_fingerprint_authenticated = models.BooleanField(default=False)
    company_authentication_timestamp = models.CharField(max_length=100, blank=True)
    company_credential_id = models.CharField(max_length=255, blank=True)
    company_ip_address = models.GenericIPAddressField(null=True, blank=True)
    company_user_agent = models.TextField(blank=True)
    
    # Validation Tracking: Admin
    admin_signed = models.BooleanField(default=False)
    admin_signed_at = models.DateTimeField(null=True, blank=True)
    admin_signed_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_conventions')
    admin_fingerprint_authenticated = models.BooleanField(default=False)
    admin_authentication_timestamp = models.CharField(max_length=100, blank=True)
    admin_credential_id = models.CharField(max_length=255, blank=True)
    admin_ip_address = models.GenericIPAddressField(null=True, blank=True)
    admin_user_agent = models.TextField(blank=True)
    
    # PDF Storage
    pdf_file = models.FileField(upload_to='conventions/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(null=True, blank=True)
    
    # Verification & Rejection
    verification_code = models.CharField(max_length=100, unique=True, blank=True, null=True)
    rejection_reason = models.TextField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='rejected_conventions')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_convention'
        ordering = ['-created_at']

    def __str__(self):
        return f"Convention: {self.student} - {self.offer.title} ({self.get_status_display()})"

    def get_signature_status(self):
        return {
            'student': {
                'signed': self.student_signed,
                'timestamp': self.student_signed_at,
                'method': 'fingerprint' if getattr(self, 'student_fingerprint_authenticated', False) else 'manual'
            },
            'company': {
                'signed': self.company_signed,
                'timestamp': self.company_signed_at,
                'method': 'fingerprint' if getattr(self, 'company_fingerprint_authenticated', False) else 'manual'
            },
            'admin': {
                'signed': self.admin_signed,
                'timestamp': self.admin_signed_at,
                'method': 'fingerprint' if getattr(self, 'admin_fingerprint_authenticated', False) else 'manual'
            }
        }
