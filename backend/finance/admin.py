from django.contrib import admin
from .models import Pledge, IncomeRecord, ExpenseRecord, FinancialSummary

admin.site.register(Pledge)
admin.site.register(IncomeRecord)
admin.site.register(ExpenseRecord)
admin.site.register(FinancialSummary)
