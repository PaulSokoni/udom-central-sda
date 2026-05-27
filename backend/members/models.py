from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    leader = models.ForeignKey('Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='led_departments')

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    leader = models.ForeignKey('Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='led_groups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Choir(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    director = models.ForeignKey('Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='directed_choirs')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Member(models.Model):
    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female')]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('transferred', 'Transferred Out'),
        ('deceased', 'Deceased'),
    ]
    MARITAL_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('widowed', 'Widowed'),
        ('divorced', 'Divorced'),
    ]

    member_id = models.CharField(max_length=20, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_CHOICES, default='single')
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to='member_photos/', blank=True, null=True)

    baptism_date = models.DateField(null=True, blank=True)
    membership_date = models.DateField(default=timezone.now)
    membership_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='members', db_index=True)
    groups = models.ManyToManyField(Group, blank=True, related_name='members')
    choirs = models.ManyToManyField(Choir, blank=True, related_name='members')
    is_tithe_paying = models.BooleanField(default=False)

    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member_profile')

    # Real-time location
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_name = models.CharField(max_length=255, blank=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)
    location_sharing = models.BooleanField(default=False)

    notes = models.TextField(blank=True)
    registered_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.member_id:
            # Use PK (guaranteed unique) to avoid race conditions under concurrent writes
            self.member_id = f'UDOM-{self.pk:04d}'
            Member.objects.filter(pk=self.pk).update(member_id=self.member_id)

    def full_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p)

    def age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            b = self.date_of_birth
            if b > today:
                return None
            years = today.year - b.year - ((today.month, today.day) < (b.month, b.day))
            return years if years >= 0 else None
        return None

    def __str__(self):
        return f'{self.full_name()} ({self.member_id})'

    class Meta:
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['membership_status', 'gender']),
            models.Index(fields=['last_name', 'first_name']),
        ]


class UserRole(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('pastor', 'Pastor'),
        ('elder', 'Church Elder'),
        ('secretary', 'Church Secretary'),
        ('treasurer', 'Treasurer'),
        ('leader', 'Department / Group Leader'),
        ('member', 'Regular Member'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='role_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')

    def __str__(self):
        return f'{self.user.username} — {self.get_role_display()}'
