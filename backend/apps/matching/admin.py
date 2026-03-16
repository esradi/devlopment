from django.contrib import admin
from .models import MatchScore

@admin.register(MatchScore)
class MatchScoreAdmin(admin.ModelAdmin):
    list_display = ('student', 'offer', 'total_score', 'updated_at')
    list_filter = ('updated_at',)
    search_fields = ('student__user__first_name', 'student__user__last_name', 'offer__title')
    readonly_fields = ('updated_at',)
