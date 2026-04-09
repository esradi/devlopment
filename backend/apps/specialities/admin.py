from django.contrib import admin
from .models import (
    Domain, Speciality, Skill,
    SkillQuiz, SkillQuizQuestion, SkillQuizSubmission
)

@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(Speciality)
class SpecialityAdmin(admin.ModelAdmin):
    list_display = ['name', 'domain']
    list_filter = ['domain']
    search_fields = ['name', 'domain__name']
    raw_id_fields = ['domain']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'speciality', 'level_required']
    list_filter = ['level_required', 'speciality__domain']
    search_fields = ['name', 'speciality__name']
    raw_id_fields = ['speciality']

@admin.register(SkillQuiz)
class SkillQuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill', 'difficulty', 'time_limit_minutes')
    list_filter = ('difficulty', 'skill__name')
    search_fields = ('title', 'skill__name')

@admin.register(SkillQuizQuestion)
class SkillQuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('quiz', 'question_text_short', 'correct', 'order')
    list_filter = ('quiz', 'correct')
    search_fields = ('question_text', 'quiz__title')

    def question_text_short(self, obj):
        return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = "Question"

@admin.register(SkillQuizSubmission)
class SkillQuizSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'passed', 'submitted_at')
    list_filter = ('passed', 'quiz', 'submitted_at')
    search_fields = ('student__user__email', 'quiz__title')
