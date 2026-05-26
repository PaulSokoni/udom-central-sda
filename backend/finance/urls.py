from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PledgeViewSet, IncomeRecordViewSet, ExpenseRecordViewSet, FinancialSummaryViewSet

router = DefaultRouter()
router.register('finance/pledges', PledgeViewSet)
router.register('finance/income', IncomeRecordViewSet)
router.register('finance/expenses', ExpenseRecordViewSet)
router.register('finance/summaries', FinancialSummaryViewSet)

urlpatterns = [path('', include(router.urls))]
