from django.db import models
from django.conf import settings

import uuid

class ReferenceLetter(models.Model):
    verification_token = models.UUIDField(default=uuid.uuid4, null=True, editable=False)
    student = models.ForeignKey('accounts.Student', on_delete=models.CASCADE, related_name='reference_letters')
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_references')
    subject = models.CharField(max_length=255, default="Letter of Recommendation")
    content = models.TextField("Letter Content", help_text="The actual body text of the letter before PDF generation")
    pdf_file = models.FileField(upload_to='references/pdfs/', blank=True, null=True)
    issue_date = models.DateField(auto_now_add=True)

    class Meta:
        db_table = 'api_referenceletter'

    def __str__(self):
        return f"Reference Letter for {self.student} ({self.issue_date})"
