from django.db import models
from members.models import Member


class PrayerRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('being_prayed', 'Being Prayed For'),
        ('answered', 'Answered'),
        ('closed', 'Closed'),
    ]
    CATEGORY_CHOICES = [
        ('health', 'Health & Healing'),
        ('family', 'Family & Relationships'),
        ('financial', 'Financial'),
        ('spiritual', 'Spiritual Growth'),
        ('counseling', 'Counseling Needed'),
        ('bereavement', 'Bereavement'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='prayer_requests')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    request = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    pastor_notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        name = 'Anonymous' if self.is_anonymous else str(self.member)
        return f'{self.get_category_display()} — {name} ({self.status})'

    class Meta:
        ordering = ['-submitted_at']
