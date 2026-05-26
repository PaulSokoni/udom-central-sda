from django.db import models
from members.models import Member


class Pledge(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('partial', 'Partially Fulfilled'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='pledges')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    purpose = models.CharField(max_length=200)
    pledge_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.member} — {self.purpose} ({self.status})'

    class Meta:
        ordering = ['-pledge_date']


class IncomeRecord(models.Model):
    CATEGORY_CHOICES = [
        ('tithe', 'Tithe'),
        ('offering', 'General Offering'),
        ('thanksgiving', 'Thanksgiving'),
        ('building', 'Building Fund'),
        ('missions', 'Missions'),
        ('pledge_payment', 'Pledge Payment'),
        ('donation', 'Donation'),
        ('other', 'Other'),
    ]

    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='income_records')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    receipt_number = models.CharField(max_length=50, blank=True)
    pledge = models.ForeignKey(Pledge, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    notes = models.TextField(blank=True)
    recorded_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.get_category_display()} — {self.amount} on {self.date}'

    class Meta:
        ordering = ['-date']


class ExpenseRecord(models.Model):
    CATEGORY_CHOICES = [
        ('utilities', 'Utilities'),
        ('maintenance', 'Building Maintenance'),
        ('supplies', 'Office / Church Supplies'),
        ('salaries', 'Salaries / Allowances'),
        ('missions', 'Missions & Outreach'),
        ('events', 'Events & Programs'),
        ('welfare', 'Member Welfare'),
        ('other', 'Other'),
    ]

    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateField()
    receipt_number = models.CharField(max_length=50, blank=True)
    approved_by = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.get_category_display()} — {self.amount} on {self.date}'

    class Meta:
        ordering = ['-date']


class FinancialSummary(models.Model):
    month = models.IntegerField()
    year = models.IntegerField()
    total_income = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_tithe = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_offerings = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_expenses = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    net_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('month', 'year')
        ordering = ['-year', '-month']

    def __str__(self):
        return f'Financial Summary {self.month}/{self.year}'
