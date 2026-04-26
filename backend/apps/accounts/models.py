from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
   
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('company', 'Company'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    verification_code = models.CharField(max_length=6, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    national_id_card = models.FileField(upload_to='id_cards/', null=True, blank=True)
    id_verified = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    class Meta:
        db_table = 'api_user'

    def __str__(self):
        return f"{self.email} ({self.role})"
        
    def get_company(self):
        if hasattr(self, 'company_profile'):
            return self.company_profile
        elif hasattr(self, 'team_membership'):
            return self.team_membership.company
        return None

class Student(models.Model):
    #student profile
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    university = models.CharField(max_length=100, null=True, blank=True)
    domain = models.CharField(max_length=100, null=True, blank=True)
    speciality = models.CharField(max_length=100, null=True, blank=True)
    academic_year = models.CharField(max_length=10, null=True, blank=True)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    profile_completeness = models.IntegerField(default=30)
    skills = models.ManyToManyField('specialities.Skill', through='StudentSkill', related_name='students', blank=True)
    wilaya = models.CharField(max_length=100, blank=True, null=True)
    
    github_url = models.URLField(max_length=255, blank=True, null=True)
    linkedin_url = models.URLField(max_length=255, blank=True, null=True)
    portfolio_url = models.URLField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'api_student'

    def __str__(self):
        return self.user.get_full_name() or self.user.email

class StudentSkill(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    skill = models.ForeignKey('specialities.Skill', on_delete=models.CASCADE)
    is_verified = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'api_studentskill'
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.student} - {self.skill.name} ({'Verified' if self.is_verified else 'Declared'})"


class Company(models.Model):
    #company profile
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')
    company_name = models.CharField(max_length=200)
    company_type = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    nif = models.CharField(max_length=50, null=True, blank=True)
    registre_commerce = models.CharField(max_length=50, unique=True, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    company_size = models.CharField(max_length=50, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    referral_source = models.CharField(max_length=100, null=True, blank=True)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    verification_status = models.CharField(max_length=20, default='pending')
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.CharField(max_length=100, null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'api_company'

    def __str__(self):
        return self.company_name

class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    admin_role = models.CharField(max_length=100) 
    
    class Meta:
        db_table = 'api_adminprofile'

    def __str__(self):
        return f"{self.user.email} - {self.admin_role}"

class WebauthnCredential(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="webauthn_credentials",
    )
    name = models.CharField(max_length=100, blank=True, null=True)
    credential_id = models.TextField()
    public_key = models.TextField()
    sign_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'api_webauthncredential'

    def __str__(self):
        return self.name or f"Credential {self.pk}"

class WebauthnAuthentication(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="webauthn_auth",
    )
    challenge = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'api_webauthnauthentication'
class StudentBadge(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='badges')
    badge_name = models.CharField(max_length=100)
    badge_type = models.CharField(max_length=50) #easy,medium,hard,special
    description = models.TextField()
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_studentbadge'
        unique_together = ('student', 'badge_name')

    def __str__(self):
        return f"{self.student} - {self.badge_name}"
