from django.db import models
from django.contrib.auth.models import User


class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    AUDIENCE_CHOICES = [
        ('all', 'All Members'),
        ('active', 'Active Members Only'),
        ('leaders', 'Leaders Only'),
        ('youth', 'Youth'),
    ]

    title = models.CharField(max_length=200)
    body = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements')
    is_published = models.BooleanField(default=True)
    publish_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'[{self.get_priority_display()}] {self.title}'

    class Meta:
        ordering = ['-publish_date', '-created_at']
