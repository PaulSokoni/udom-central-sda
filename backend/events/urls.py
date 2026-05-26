from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventAttendanceViewSet, VisitorViewSet

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('event-attendance', EventAttendanceViewSet)
router.register('visitors', VisitorViewSet)

urlpatterns = [path('', include(router.urls))]
