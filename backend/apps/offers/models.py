from django.db import models
from django.conf import settings

class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name
    class Meta: db_table = 'api_domain'

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
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    requirements = models.TextField(blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
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
