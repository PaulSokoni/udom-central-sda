from django.db import models
from members.models import Member


class AttendanceRecord(models.Model):
    SERVICE_CHOICES = [
        ('sabbath', 'Sabbath Service'),
        ('midweek', 'Midweek Prayer'),
        ('youth', 'Youth Service'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='sabbath')
    present = models.BooleanField(default=True)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ['member', 'date', 'service_type']
        ordering = ['-date']

    def __str__(self):
        return f'{self.member.full_name()} - {self.date} ({self.get_service_type_display()})'


class TitheOffering(models.Model):
    CATEGORY_CHOICES = [
        ('tithe', 'Tithe'),
        ('offering', 'Regular Offering'),
        ('thanksgiving', 'Thanksgiving'),
        ('building', 'Building Fund'),
        ('missions', 'Missions'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='contributions')
    date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='tithe')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    receipt_number = models.CharField(max_length=50, blank=True)
    notes = models.CharField(max_length=200, blank=True)
    recorded_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.member.full_name()} - {self.get_category_display()} - {self.amount} ({self.date})'


class BibleStudyRecord(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='bible_study')
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    sabbath_school_attendance = models.PositiveSmallIntegerField(default=0)
    personal_study_days = models.PositiveSmallIntegerField(default=0)
    completed_lesson = models.BooleanField(default=False)
    outreach_count = models.PositiveSmallIntegerField(default=0, help_text='Number of people shared Gospel with')
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['member', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f'{self.member.full_name()} - {self.month}/{self.year}'


class BaptismRecord(models.Model):
    TYPE_CHOICES = [
        ('baptism', 'Baptism'),
        ('transfer_in', 'Transfer In'),
        ('transfer_out', 'Transfer Out'),
        ('reclaimed', 'Reclaimed'),
        ('deceased', 'Deceased'),
        ('missing', 'Missing'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='baptism_records')
    record_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    date = models.DateField()
    officiating_pastor = models.CharField(max_length=100, blank=True)
    transfer_church = models.CharField(max_length=200, blank=True, help_text='For transfers: source/destination church')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f'{self.member.full_name()} - {self.get_record_type_display()} ({self.date})'


class MonthlyReport(models.Model):
    month = models.PositiveSmallIntegerField()
    year = models.PositiveSmallIntegerField()
    prepared_by = models.CharField(max_length=100)
    prepared_date = models.DateField(auto_now_add=True)

    total_members = models.PositiveIntegerField(default=0)
    active_members = models.PositiveIntegerField(default=0)
    new_baptisms = models.PositiveIntegerField(default=0)
    transfers_in = models.PositiveIntegerField(default=0)
    transfers_out = models.PositiveIntegerField(default=0)
    deceased = models.PositiveIntegerField(default=0)

    avg_sabbath_attendance = models.PositiveIntegerField(default=0)
    avg_midweek_attendance = models.PositiveIntegerField(default=0)

    total_tithe = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_offering = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_contributions = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    bible_study_participants = models.PositiveIntegerField(default=0)
    outreach_contacts = models.PositiveIntegerField(default=0)

    highlights = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    prayer_requests = models.TextField(blank=True)

    is_finalized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['month', 'year']
        ordering = ['-year', '-month']

    def month_name(self):
        import calendar
        return calendar.month_name[self.month]

    def __str__(self):
        return f'Report - {self.month_name()} {self.year}'
