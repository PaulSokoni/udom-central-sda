from django.db import models
from members.models import Member


class Event(models.Model):
    TYPE_CHOICES = [
        ('worship', 'Worship Service'),
        ('prayer', 'Prayer Session'),
        ('special', 'Special Event'),
        ('youth', 'Youth Program'),
        ('outreach', 'Community Outreach'),
        ('meeting', 'Church Meeting'),
        ('seminar', 'Seminar / Workshop'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    event_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='worship')
    description = models.TextField(blank=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    organizer = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='organized_events')
    is_recurring = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.title} ({self.start_datetime.date()})'

    class Meta:
        ordering = ['-start_datetime']


class EventAttendance(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='attendances')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, null=True, blank=True, related_name='event_attendances')
    is_visitor = models.BooleanField(default=False)
    visitor_name = models.CharField(max_length=100, blank=True)
    visitor_phone = models.CharField(max_length=20, blank=True)
    visitor_address = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('event', 'member')
        ordering = ['recorded_at']

    def __str__(self):
        if self.is_visitor:
            return f'Visitor: {self.visitor_name} @ {self.event}'
        return f'{self.member} @ {self.event}'


class Visitor(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    home_church = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=200, blank=True)
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='registered_visitors')
    visit_date = models.DateField()
    wants_followup = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.name} — {self.visit_date}'

    class Meta:
        ordering = ['-registered_at']
