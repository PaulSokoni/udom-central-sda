from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PrayerRequest
from .serializers import PrayerRequestSerializer, PrayerRequestSubmitSerializer
from members.utils import can_view_all_prayers
from members.permissions import IsPastorOrAdmin


class PrayerRequestViewSet(viewsets.ModelViewSet):
    queryset = PrayerRequest.objects.all()
    serializer_class = PrayerRequestSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if can_view_all_prayers(request.user):
            qs = PrayerRequest.objects.all()
        else:
            try:
                member = request.user.member_profile
                qs = PrayerRequest.objects.filter(member=member)
            except Exception:
                return Response({'detail': 'No member profile linked to your account.'}, status=403)
        return Response(PrayerRequestSerializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        try:
            member = request.user.member_profile
        except Exception:
            return Response({'detail': 'You must have a linked member profile to submit prayer requests.'}, status=400)
        serializer = PrayerRequestSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(member=member)
        return Response(PrayerRequestSerializer(obj).data, status=201)

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        if not can_view_all_prayers(request.user):
            try:
                member = request.user.member_profile
                if obj.member != member:
                    return Response({'detail': 'Access denied.'}, status=403)
            except Exception:
                return Response({'detail': 'Access denied.'}, status=403)
        return Response(PrayerRequestSerializer(obj).data)

    def update(self, request, *args, **kwargs):
        if not can_view_all_prayers(request.user):
            return Response({'detail': 'Only pastors, elders, or admins can update prayer requests.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not IsPastorOrAdmin().has_permission(request, self):
            return Response({'detail': 'Pastor or admin only.'}, status=403)
        return super().destroy(request, *args, **kwargs)
