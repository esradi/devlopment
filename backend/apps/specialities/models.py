from django.db import models

class Domain(models.Model):
    """Academic/Specialization Domain (e.g., Computer Science, Biology, Medicine)"""
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'specialities_domain'


class Speciality(models.Model):
    """Specific speciality within a domain (e.g., Software Engineering, Data Science)"""
    name = models.CharField(max_length=100)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='specialities')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.domain.name})"

    class Meta:
        db_table = 'specialities_speciality'
        unique_together = ['name', 'domain']


class Competency(models.Model):
    """Skills/Competencies required for a speciality"""
    name = models.CharField(max_length=100)
    speciality = models.ForeignKey(Speciality, on_delete=models.CASCADE, related_name='competencies')
    description = models.TextField(blank=True, null=True)
    level_required = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='intermediate'
    )

    def __str__(self):
        return f"{self.name} - {self.speciality.name}"

    class Meta:
        db_table = 'specialities_competency'
        unique_together = ['name', 'speciality']
