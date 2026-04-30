from django.contrib import admin
from .models import SkillChallenge, SkillChallengeSubmission, ChallengeSession

@admin.register(SkillChallenge)
class SkillChallengeAdmin(admin.ModelAdmin):
    list_display = ('skill_name', 'speciality', 'challenge_type', 'difficulty')
    list_filter  = ('speciality', 'challenge_type', 'difficulty')
    search_fields = ('skill_name', 'title')

@admin.register(SkillChallengeSubmission)
class SkillChallengeSubmissionAdmin(admin.ModelAdmin):
    list_display = ('student', 'challenge', 'score', 'passed', 'submitted_at')
    list_filter  = ('passed', 'challenge__speciality')
    readonly_fields = ('submitted_at',)

@admin.register(ChallengeSession)
class ChallengeSessionAdmin(admin.ModelAdmin):
    list_display = ('student', 'challenge', 'start_time', 'is_completed')
    list_filter  = ('is_completed',)