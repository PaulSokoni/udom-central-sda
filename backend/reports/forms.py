from django import forms
from .models import AttendanceRecord, TitheOffering, BibleStudyRecord, BaptismRecord, MonthlyReport
from members.models import Member
import calendar


MONTH_CHOICES = [(i, calendar.month_name[i]) for i in range(1, 13)]
YEAR_CHOICES = [(y, y) for y in range(2020, 2031)]


class AttendanceForm(forms.ModelForm):
    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        widgets = {
            'member': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'service_type': forms.Select(attrs={'class': 'form-select'}),
            'present': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'notes': forms.TextInput(attrs={'class': 'form-control'}),
        }


class BulkAttendanceForm(forms.Form):
    date = forms.DateField(widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}))
    service_type = forms.ChoiceField(
        choices=AttendanceRecord.SERVICE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'})
    )


class TitheOfferingForm(forms.ModelForm):
    class Meta:
        model = TitheOffering
        fields = '__all__'
        widgets = {
            'member': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'amount': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'receipt_number': forms.TextInput(attrs={'class': 'form-control'}),
            'notes': forms.TextInput(attrs={'class': 'form-control'}),
            'recorded_by': forms.TextInput(attrs={'class': 'form-control'}),
        }


class BibleStudyForm(forms.ModelForm):
    month = forms.ChoiceField(choices=MONTH_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))
    year = forms.ChoiceField(choices=YEAR_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))

    class Meta:
        model = BibleStudyRecord
        fields = '__all__'
        widgets = {
            'member': forms.Select(attrs={'class': 'form-select'}),
            'sabbath_school_attendance': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'max': 5}),
            'personal_study_days': forms.NumberInput(attrs={'class': 'form-control', 'min': 0, 'max': 31}),
            'completed_lesson': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'outreach_count': forms.NumberInput(attrs={'class': 'form-control', 'min': 0}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }


class BaptismRecordForm(forms.ModelForm):
    class Meta:
        model = BaptismRecord
        fields = '__all__'
        widgets = {
            'member': forms.Select(attrs={'class': 'form-select'}),
            'record_type': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'officiating_pastor': forms.TextInput(attrs={'class': 'form-control'}),
            'transfer_church': forms.TextInput(attrs={'class': 'form-control'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
        }


class MonthlyReportForm(forms.ModelForm):
    month = forms.ChoiceField(choices=MONTH_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))
    year = forms.ChoiceField(choices=YEAR_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))

    class Meta:
        model = MonthlyReport
        fields = '__all__'
        widgets = {
            'prepared_by': forms.TextInput(attrs={'class': 'form-control'}),
            'total_members': forms.NumberInput(attrs={'class': 'form-control'}),
            'active_members': forms.NumberInput(attrs={'class': 'form-control'}),
            'new_baptisms': forms.NumberInput(attrs={'class': 'form-control'}),
            'transfers_in': forms.NumberInput(attrs={'class': 'form-control'}),
            'transfers_out': forms.NumberInput(attrs={'class': 'form-control'}),
            'deceased': forms.NumberInput(attrs={'class': 'form-control'}),
            'avg_sabbath_attendance': forms.NumberInput(attrs={'class': 'form-control'}),
            'avg_midweek_attendance': forms.NumberInput(attrs={'class': 'form-control'}),
            'total_tithe': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'total_offering': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'total_contributions': forms.NumberInput(attrs={'class': 'form-control', 'step': '0.01'}),
            'bible_study_participants': forms.NumberInput(attrs={'class': 'form-control'}),
            'outreach_contacts': forms.NumberInput(attrs={'class': 'form-control'}),
            'highlights': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'challenges': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'prayer_requests': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'is_finalized': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class ReportFilterForm(forms.Form):
    month = forms.ChoiceField(
        choices=[('', 'All Months')] + MONTH_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    year = forms.ChoiceField(
        choices=[('', 'All Years')] + YEAR_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
