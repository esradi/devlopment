from django.db import models
from apps.specialities.models import Domain, Skill
from django.conf import settings

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name
    class Meta: db_table = 'api_location'

class OfferType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    def __str__(self): return self.name
    class Meta: db_table = 'api_offertype'

class DurationOption(models.Model):
    months = models.IntegerField(unique=True)
    def __str__(self): return f"{self.months} months"
    class Meta: db_table = 'api_durationoption'

class Offer(models.Model):
    """Internship/Job Offer"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('draft', 'Draft'),
        ('filled', 'Filled'),
    ]
    
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='offers')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Many-to-Many Attributes
    domains = models.ManyToManyField(Domain, related_name='offers')
    locations = models.ManyToManyField(Location, related_name='offers')
    offer_types = models.ManyToManyField(OfferType, related_name='offers')
    durations = models.ManyToManyField(DurationOption, related_name='offers')
    skills = models.ManyToManyField(Skill, related_name='offers', blank=True)
    wilaya = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    requirements = models.TextField(blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    deadline = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'api_offer'

    def __str__(self):
        return f"{self.title} at {self.company.company_name}"


class FavoriteOffer(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_offers')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_favoriteoffer'
        unique_together = ('user', 'offer')

    def __str__(self):
        return f"{self.user.email} likes {self.offer.title}"

class Application(models.Model):
    """Student application to an Offer"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='applications')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='applications')
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    cover_letter = models.TextField(blank=True, null=True)
    company_notes = models.TextField(blank=True, null=True)  # Company internal notes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_application'
        unique_together = ('student', 'offer')

    def __str__(self):
        return f"{self.student} -> {self.offer.title} ({self.get_status_display()})"


class Interview(models.Model):
    """Interview for an application"""
    STATUS_CHOICES = [
        ('proposed', 'Proposed'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    METHOD_CHOICES = [
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
        ('phone', 'Phone Call'),
    ]
    
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='interview')
    company = models.ForeignKey('accounts.Company', on_delete=models.CASCADE, related_name='interviews')
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='interviews')
    
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(default=45) # in minutes
    
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='video')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='proposed')
    
    join_url = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'api_interview'

    def __str__(self):
        return f"Interview: {self.student} - {self.date} at {self.time}"


class Message(models.Model):
    """Simple message between users"""
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_message'
        ordering = ['created_at']

    def __str__(self):
        return f"From {self.sender.email} to {self.receiver.email}"
