from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DoctrineViewSet

router = DefaultRouter()
router.register('doctrines', DoctrineViewSet)

urlpatterns = [path('', include(router.urls))]
