from django.contrib import admin
from .models import StudyGroup, StudyGroupMember, GroupMessage, GroupResource

@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'domain', 'speciality', 'created_at')
    search_fields = ('name', 'topic', 'creator__email')
    list_filter = ('created_at', 'domain', 'speciality')
    readonly_fields = ('created_at',)

@admin.register(StudyGroupMember)
class StudyGroupMemberAdmin(admin.ModelAdmin):
    list_display = ('group', 'student', 'joined_at')
    search_fields = ('group__name',)
    list_filter = ('joined_at',)

@admin.register(GroupMessage)
class GroupMessageAdmin(admin.ModelAdmin):
    list_display = ('group', 'sender', 'timestamp')
    search_fields = ('group__name', 'sender__email', 'content')
    list_filter = ('timestamp',)
    readonly_fields = ('timestamp',)

@admin.register(GroupResource)
class GroupResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'uploaded_by', 'uploaded_at')
    search_fields = ('title', 'group__name', 'uploaded_by__email')
    list_filter = ('uploaded_at',)
    readonly_fields = ('uploaded_at',)
