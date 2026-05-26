from django.contrib import admin
from .models import AttendanceRecord, TitheOffering, BibleStudyRecord, BaptismRecord, MonthlyReport


@admin.register(AttendanceRecord)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'service_type', 'present']
    list_filter = ['service_type', 'present', 'date']
    search_fields = ['member__first_name', 'member__last_name']


@admin.register(TitheOffering)
class TitheAdmin(admin.ModelAdmin):
    list_display = ['member', 'date', 'category', 'amount', 'receipt_number']
    list_filter = ['category', 'date']
    search_fields = ['member__first_name', 'member__last_name', 'receipt_number']


@admin.register(BibleStudyRecord)
class BibleStudyAdmin(admin.ModelAdmin):
    list_display = ['member', 'month', 'year', 'sabbath_school_attendance', 'personal_study_days', 'completed_lesson']
    list_filter = ['year', 'month', 'completed_lesson']


@admin.register(BaptismRecord)
class BaptismAdmin(admin.ModelAdmin):
    list_display = ['member', 'record_type', 'date', 'officiating_pastor']
    list_filter = ['record_type', 'date']
    search_fields = ['member__first_name', 'member__last_name']


@admin.register(MonthlyReport)
class MonthlyReportAdmin(admin.ModelAdmin):
    list_display = ['month', 'year', 'total_members', 'active_members', 'new_baptisms', 'total_contributions', 'is_finalized']
    list_filter = ['year', 'is_finalized']
    readonly_fields = ['prepared_date', 'created_at', 'updated_at']
