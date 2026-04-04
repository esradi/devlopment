from django.db import models

class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'specialities_domain'


class Speciality(models.Model):
    name = models.CharField(max_length=100)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='specialities')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.domain.name})"

    class Meta:
        db_table = 'specialities_speciality'
        unique_together = ['name', 'domain']


class Competency(models.Model):
    #Skills/Competencies required for a speciality
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


class CompetencyQuiz(models.Model):
    #Quiz associated with a specific competency
    competency = models.OneToOneField(Competency, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True, null=True)
    time_limit_minutes = models.IntegerField(default=15)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='intermediate'
    )
    
    class Meta:
        db_table = 'specialities_competencyquiz'

    def __str__(self):
        return f"Quiz for: {self.competency.name}"


class QuizQuestion(models.Model):
    #Multiple choice question for a competency quiz
    quiz = models.ForeignKey(CompetencyQuiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct = models.CharField(
        max_length=1, 
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')]
    )
    explanation = models.TextField(blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'specialities_quizquestion'
        ordering = ['order']

    def __str__(self):
        return f"Q: {self.question_text[:30]}..."


class QuizSubmission(models.Model):
    #Record of a student's quiz attempt
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='quiz_submissions')
    quiz = models.ForeignKey(CompetencyQuiz, on_delete=models.CASCADE, related_name='submissions')
    answers = models.JSONField(default=dict)
    score = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'specialities_quizsubmission'

    def __str__(self):
        return f"{self.student} - {self.quiz.title} - {self.score}%"


class PortfolioSubmission(models.Model):
    #Student submitting a portfolio to verify a specific competency
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='portfolio_submissions')
    competency = models.ForeignKey('Competency', on_delete=models.CASCADE, related_name='portfolio_submissions')
    portfolio_url = models.URLField(max_length=500)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    feedback = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'specialities_portfoliosubmission'
        
    def __str__(self):
        return f"{self.student} - {self.competency.name} ({self.status})"
