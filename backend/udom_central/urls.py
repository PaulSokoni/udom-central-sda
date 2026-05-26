from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.throttling import AnonRateThrottle
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class RateLimitedTokenView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    from members.utils import get_role
    role = get_role(request.user)
    member_pk = None
    try:
        member_pk = request.user.member_profile.pk
    except Exception:
        pass
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'full_name': request.user.get_full_name(),
        'email': request.user.email,
        'is_staff': request.user.is_staff,
        'is_superuser': request.user.is_superuser,
        'role': role,
        'member_pk': member_pk,
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', RateLimitedTokenView.as_view(), name='token_obtain'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', me, name='me'),
    path('api/', include('members.urls')),
    path('api/', include('reports.urls')),
    path('api/', include('events.urls')),
    path('api/', include('finance.urls')),
    path('api/', include('communication.urls')),
    path('api/', include('prayer.urls')),
    path('api/', include('doctrines.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
