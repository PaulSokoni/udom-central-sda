from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.core.cache import cache

from members.permissions import IsPastorOrAdmin
from members.utils import is_super
from .models import AttendanceRecord, TitheOffering, BibleStudyRecord, BaptismRecord, MonthlyReport
from .serializers import (AttendanceSerializer, TitheOfferingSerializer,
                           BibleStudySerializer, BaptismRecordSerializer, MonthlyReportSerializer)
from members.models import Member


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.select_related('member').order_by('-date')
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        member = self.request.query_params.get('member')
        service = self.request.query_params.get('service_type')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        if member:
            qs = qs.filter(member_id=member)
        if service:
            qs = qs.filter(service_type=service)
        return qs

    @action(detail=False, methods=['post'], permission_classes=[IsPastorOrAdmin])
    def bulk(self, request):
        date = request.data.get('date')
        service_type = request.data.get('service_type')
        present_ids = {str(x) for x in request.data.get('present_ids', [])}
        members = list(Member.objects.filter(membership_status='active').only('pk'))

        records = [
            AttendanceRecord(
                member=m,
                date=date,
                service_type=service_type,
                present=str(m.pk) in present_ids,
            )
            for m in members
        ]
        AttendanceRecord.objects.bulk_create(
            records,
            update_conflicts=True,
            unique_fields=['member', 'date', 'service_type'],
            update_fields=['present'],
        )
        present_count = sum(1 for r in records if r.present)
        return Response({'saved': len(records), 'present': present_count})


class TitheOfferingViewSet(viewsets.ModelViewSet):
    queryset = TitheOffering.objects.select_related('member').order_by('-date')
    serializer_class = TitheOfferingSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        member = self.request.query_params.get('member')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        if member:
            qs = qs.filter(member_id=member)
        return qs

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user.get_full_name() or self.request.user.username)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        by_category = list(qs.values('category').annotate(total=Sum('amount')))
        grand_total = qs.aggregate(total=Sum('amount'))['total'] or 0
        return Response({'by_category': by_category, 'grand_total': grand_total})


class BibleStudyViewSet(viewsets.ModelViewSet):
    queryset = BibleStudyRecord.objects.select_related('member').order_by('-year', '-month')
    serializer_class = BibleStudySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)
        return qs


class BaptismViewSet(viewsets.ModelViewSet):
    queryset = BaptismRecord.objects.select_related('member').order_by('-date')
    serializer_class = BaptismRecordSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]


class MonthlyReportViewSet(viewsets.ModelViewSet):
    queryset = MonthlyReport.objects.all().order_by('-year', '-month')
    serializer_class = MonthlyReportSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'auto_generate']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(prepared_by=self.request.user.get_full_name() or self.request.user.username)

    @action(detail=False, methods=['post'])
    def auto_generate(self, request):
        month = int(request.data.get('month', timezone.now().month))
        year = int(request.data.get('year', timezone.now().year))

        # All member counts in one query
        member_stats = Member.objects.aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(membership_status='active')),
        )

        attendance = AttendanceRecord.objects.filter(date__month=month, date__year=year)
        sabbath_days = attendance.filter(service_type='sabbath').values('date').distinct().count()
        midweek_days = attendance.filter(service_type='midweek').values('date').distinct().count()
        avg_sabbath = (attendance.filter(service_type='sabbath').count() // sabbath_days) if sabbath_days else 0
        avg_midweek = (attendance.filter(service_type='midweek').count() // midweek_days) if midweek_days else 0

        contributions = TitheOffering.objects.filter(date__month=month, date__year=year)
        contrib_totals = contributions.aggregate(
            total_tithe=Sum('amount', filter=Q(category='tithe')),
            total_offering=Sum('amount', filter=~Q(category='tithe')),
            total=Sum('amount'),
        )

        baptisms = BaptismRecord.objects.filter(date__month=month, date__year=year)
        baptism_counts = baptisms.aggregate(
            baptism=Count('id', filter=Q(record_type='baptism')),
            transfer_in=Count('id', filter=Q(record_type='transfer_in')),
            transfer_out=Count('id', filter=Q(record_type='transfer_out')),
            deceased=Count('id', filter=Q(record_type='deceased')),
        )

        bs = BibleStudyRecord.objects.filter(month=month, year=year)
        bs_stats = bs.aggregate(participants=Count('id'), outreach=Sum('outreach_count'))

        report, created = MonthlyReport.objects.update_or_create(
            month=month, year=year,
            defaults={
                'prepared_by': request.user.get_full_name() or request.user.username,
                'total_members': member_stats['total'],
                'active_members': member_stats['active'],
                'new_baptisms': baptism_counts['baptism'],
                'transfers_in': baptism_counts['transfer_in'],
                'transfers_out': baptism_counts['transfer_out'],
                'deceased': baptism_counts['deceased'],
                'avg_sabbath_attendance': avg_sabbath,
                'avg_midweek_attendance': avg_midweek,
                'total_tithe': contrib_totals['total_tithe'] or 0,
                'total_offering': contrib_totals['total_offering'] or 0,
                'total_contributions': contrib_totals['total'] or 0,
                'bible_study_participants': bs_stats['participants'] or 0,
                'outreach_contacts': bs_stats['outreach'] or 0,
            }
        )
        cache.delete('dashboard_stats')
        return Response({'created': created, 'report': MonthlyReportSerializer(report).data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    cached = cache.get('dashboard_stats')
    if cached:
        return Response(cached)

    now = timezone.now()

    # All member counts in a single aggregation query
    member_stats = Member.objects.aggregate(
        total_members=Count('id'),
        active_members=Count('id', filter=Q(membership_status='active')),
        male_count=Count('id', filter=Q(gender='M', membership_status='active')),
        female_count=Count('id', filter=Q(gender='F', membership_status='active')),
    )

    this_month_baptisms = BaptismRecord.objects.filter(
        date__month=now.month, date__year=now.year, record_type='baptism'
    ).count()

    recent_members = list(
        Member.objects.order_by('-created_at')[:5].values(
            'id', 'member_id', 'first_name', 'last_name', 'membership_status', 'created_at'
        )
    )

    latest_report = MonthlyReport.objects.first()
    latest_report_data = MonthlyReportSerializer(latest_report).data if latest_report else None

    data = {
        **member_stats,
        'this_month_baptisms': this_month_baptisms,
        'recent_members': recent_members,
        'latest_report': latest_report_data,
    }
    cache.set('dashboard_stats', data, 60)
    return Response(data)
