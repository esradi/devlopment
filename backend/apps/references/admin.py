from django.contrib import admin
from .models import ReferenceLetter

@admin.register(ReferenceLetter)
class ReferenceLetterAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'generated_by', 'issue_date')
    search_fields = ('student__user__email', 'student__user__first_name', 'student__user__last_name', 'subject', 'verification_token')
    list_filter = ('issue_date',)
    readonly_fields = ('verification_token', 'issue_date')
