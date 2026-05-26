from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, DepartmentViewSet, GroupViewSet, ChoirViewSet, UserRoleViewSet

router = DefaultRouter()
router.register('members', MemberViewSet, basename='member')
router.register('departments', DepartmentViewSet, basename='department')
router.register('groups', GroupViewSet, basename='group')
router.register('choirs', ChoirViewSet, basename='choir')
router.register('user-roles', UserRoleViewSet, basename='user-role')

urlpatterns = [path('', include(router.urls))]
