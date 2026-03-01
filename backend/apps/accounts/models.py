from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User with roles"""
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
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']
    
    class Meta:
        db_table = 'api_user'

    def __str__(self):
        return f"{self.email} ({self.role})"


class Student(models.Model):
    """Student Profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    university = models.CharField(max_length=100, null=True, blank=True)
    domain = models.CharField(max_length=100, null=True, blank=True)
    speciality = models.CharField(max_length=100, null=True, blank=True)
    academic_year = models.CharField(max_length=10, null=True, blank=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    cv = models.FileField(upload_to='cvs/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    profile_completeness = models.IntegerField(default=30)
    
    class Meta:
        db_table = 'api_student'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Company(models.Model):
    """Company Profile"""
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
    
    class Meta:
        db_table = 'api_company'

    def __str__(self):
        return self.company_name

class AdminProfile(models.Model):
    """University Administration Profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    admin_role = models.CharField(max_length=100) # e.g. Dean, Career Service, Dept Head
    
    class Meta:
        db_table = 'api_adminprofile'

    def __str__(self):
        return f"{self.user.email} - {self.admin_role}"
