from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrayerRequestViewSet

router = DefaultRouter()
router.register('prayer-requests', PrayerRequestViewSet)

urlpatterns = [path('', include(router.urls))]
