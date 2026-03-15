from django.db import models
from apps.accounts.models import Student


class SkillChallenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    TYPE_CHOICES = [
        ('coding', 'Coding'),
        ('qcm', 'QCM (Multiple Choice)'),
        ('text', 'Written/Essay'),
    ]

    skill_name         = models.CharField(max_length=100)
    speciality         = models.CharField(max_length=100)
    language           = models.CharField(max_length=50, blank=True, null=True)  # coding only
    challenge_type     = models.CharField(max_length=10, choices=TYPE_CHOICES, default='coding')
    title              = models.CharField(max_length=200)
    description        = models.TextField()
    starter_code       = models.TextField(blank=True, null=True)   # coding only
    test_cases         = models.JSONField(blank=True, null=True)   # coding only — NEVER sent to frontend
    questions          = models.JSONField(blank=True, null=True)   # QCM questions OR text evaluation criteria
    time_limit_minutes = models.IntegerField(default=15)
    difficulty         = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    created_at         = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_skillchallenge'

    def __str__(self):
        return f"[{self.challenge_type.upper()}] {self.skill_name} ({self.speciality})"


class SkillChallengeSubmission(models.Model):
    student           = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='skill_challenge_submissions')
    challenge         = models.ForeignKey(SkillChallenge, on_delete=models.CASCADE, related_name='submissions')
    submitted_code    = models.TextField(blank=True, null=True)    # coding only
    submitted_answers = models.JSONField(blank=True, null=True)    # QCM only: {"0": "A", "1": "C", ...}
    submitted_text    = models.TextField(blank=True, null=True)    # essay only
    score             = models.IntegerField(default=0)             # 0-100
    passed            = models.BooleanField(default=False)
    feedback          = models.TextField(blank=True)
    submitted_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_submission'
        ordering = ['-submitted_at']

    def __str__(self):
        status = " ✅ PASSED" if self.passed else " ❌ FAILED"
        return f"{self.student} → {self.challenge.skill_name} | {self.score}% {status}"


class ChallengeSession(models.Model):
    """Tracks a student's active engagement with a challenge (Timer/Preparation)"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='challenge_sessions')
    challenge = models.ForeignKey(SkillChallenge, on_delete=models.CASCADE, related_name='sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'challenge_session'

    def __str__(self):
        return f"{self.student} - {self.challenge.skill_name} Session"

    @property
    def preparation_over(self):
        """Preparation timer (e.g. 30 seconds)"""
        import datetime
        from django.utils import timezone
        return (timezone.now() - self.start_time).total_seconds() > 30