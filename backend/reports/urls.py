from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (AttendanceViewSet, TitheOfferingViewSet,
                    BibleStudyViewSet, BaptismViewSet, MonthlyReportViewSet,
                    dashboard_stats)

router = DefaultRouter()
router.register('attendance', AttendanceViewSet, basename='attendance')
router.register('tithe', TitheOfferingViewSet, basename='tithe')
router.register('bible-study', BibleStudyViewSet, basename='bible-study')
router.register('baptisms', BaptismViewSet, basename='baptism')
router.register('monthly-reports', MonthlyReportViewSet, basename='monthly-report')

urlpatterns = router.urls + [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
]
