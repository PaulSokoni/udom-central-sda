from django.contrib import admin
from .models import Member, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['member_id', 'full_name', 'gender', 'phone', 'membership_status', 'department', 'membership_date']
    list_filter = ['membership_status', 'gender', 'department']
    search_fields = ['first_name', 'last_name', 'member_id', 'phone']
    readonly_fields = ['member_id', 'created_at', 'updated_at']
    ordering = ['last_name', 'first_name']

    def full_name(self, obj):
        return obj.full_name()
    full_name.short_description = 'Name'
