from django.contrib import admin
from .models import User, Student, Company, AdminProfile, StudentSkill, StudentBadge

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'role', 'email_verified')
    list_filter = ('role', 'email_verified')

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('user', 'speciality', 'university')
    search_fields = ('user__email', 'speciality')

@admin.register(StudentBadge)
class StudentBadgeAdmin(admin.ModelAdmin):
    list_display = ('student', 'badge_name', 'badge_type', 'earned_at')
    list_filter = ('badge_type', 'earned_at')
    readonly_fields = ('earned_at',)

admin.site.register(Company)
admin.site.register(AdminProfile)
admin.site.register(StudentSkill)
