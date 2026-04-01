from django.contrib import admin
from .models import InternshipValidation

@admin.register(InternshipValidation)
class InternshipValidationAdmin(admin.ModelAdmin):
    list_display = ('application', 'status', 'validated_by', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = (
    'application__offer__title',
    'application__student__user__first_name',
    'application__student__user__last_name',
    'application__student__user__email',
    'status',
    )
    readonly_fields = ('created_at', 'updated_at')
