from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from members.permissions import IsPastorOrAdmin
from rest_framework.response import Response
from django.utils import timezone
from .models import Event, EventAttendance, Visitor
from .serializers import EventSerializer, EventAttendanceSerializer, VisitorSerializer, VisitorSelfRegisterSerializer


class VisitorRegisterThrottle(AnonRateThrottle):
    scope = 'visitor_register'


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Event.objects.all()
        event_type = self.request.query_params.get('type')
        if event_type:
            qs = qs.filter(event_type=event_type)
        upcoming = self.request.query_params.get('upcoming')
        if upcoming:
            qs = qs.filter(start_datetime__gte=timezone.now())
        return qs

    @action(detail=True, methods=['get', 'post'])
    def attendance(self, request, pk=None):
        event = self.get_object()
        if request.method == 'GET':
            records = event.attendances.all()
            return Response(EventAttendanceSerializer(records, many=True).data)

        data = request.data.copy()
        data['event'] = event.id

        member_ids = data.get('member_ids', [])
        if member_ids:
            created = []
            for mid in member_ids:
                obj, _ = EventAttendance.objects.get_or_create(event=event, member_id=mid)
                created.append(obj)
            return Response(EventAttendanceSerializer(created, many=True).data, status=201)

        serializer = EventAttendanceSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=201)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        events = Event.objects.filter(start_datetime__gte=timezone.now())[:10]
        return Response(EventSerializer(events, many=True).data)


class EventAttendanceViewSet(viewsets.ModelViewSet):
    queryset = EventAttendance.objects.all()
    serializer_class = EventAttendanceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all()

    def get_throttles(self):
        if self.action == 'create':
            return [VisitorRegisterThrottle()]
        return super().get_throttles()

    def get_serializer_class(self):
        if self.action == 'create' and not (self.request.user and self.request.user.is_authenticated):
            return VisitorSelfRegisterSerializer
        return VisitorSerializer

    def get_permissions(self):
        if self.action in ['create', 'upcoming_events']:
            return [AllowAny()]
        if self.action in ['destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Visitor.objects.all()
        event_id = self.request.query_params.get('event')
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    @action(detail=False, methods=['get'])
    def upcoming_events(self, request):
        events = Event.objects.filter(start_datetime__gte=timezone.now()).order_by('start_datetime')[:20]
        return Response(EventSerializer(events, many=True).data)
