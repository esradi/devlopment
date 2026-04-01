from django.db import models
from django.conf import settings

class StudyGroup(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    domain = models.ForeignKey('specialities.Domain', on_delete=models.SET_NULL, null=True, blank=True, related_name='study_groups')
    speciality = models.ForeignKey('specialities.Speciality', on_delete=models.SET_NULL, null=True, blank=True, related_name='study_groups')
    topic = models.CharField(max_length=200, blank=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_studygroup'

    def __str__(self):
        return self.name

class StudyGroupMember(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='members')
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='group_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_studygroupmember'
        unique_together = ('group', 'student')

    def __str__(self):
        return f"{self.student} in {self.group.name}"

class GroupMessage(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='group_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_groupmessage'
        ordering = ['-timestamp']

    def __str__(self):
        return f"Message by {self.sender} in {self.group.name}"

class GroupResource(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='resources')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_resources')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='groups/resources/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_groupresource'

    def __str__(self):
        return f"{self.title} in {self.group.name}"
