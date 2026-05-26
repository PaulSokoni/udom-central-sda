from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from members.permissions import IsPastorOrAdmin
from django.utils import timezone
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.filter(is_published=True)
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Announcement.objects.filter(is_published=True)
        today = timezone.now().date()
        qs = qs.filter(publish_date__lte=today)
        # Exclude expired
        qs = qs.exclude(expiry_date__lt=today)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
