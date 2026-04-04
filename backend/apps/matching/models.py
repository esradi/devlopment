from django.db import models
from apps.accounts.models import Student
from apps.offers.models import Offer

class MatchScore(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='match_scores')
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='match_scores')
    total_score = models.FloatField()
    breakdown = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'offer')
        ordering = ['-total_score']

    def __str__(self):
        return f"{self.student.user.get_full_name()} <> {self.offer.title} ({self.total_score})"
