from django.contrib import admin
from .models import Domain, Speciality, Competency

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

@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'speciality', 'level_required']
    list_filter = ['level_required', 'speciality__domain']
    search_fields = ['name', 'speciality__name']
    raw_id_fields = ['speciality']
