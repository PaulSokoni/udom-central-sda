from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from members.permissions import IsPastorOrAdmin
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from .models import Pledge, IncomeRecord, ExpenseRecord, FinancialSummary
from .serializers import (
    PledgeSerializer, IncomeRecordSerializer,
    ExpenseRecordSerializer, FinancialSummarySerializer
)
from members.utils import can_view_finance


def is_treasurer_or_admin(user):
    return can_view_finance(user)


class PledgeViewSet(viewsets.ModelViewSet):
    queryset = Pledge.objects.select_related('member').all()
    serializer_class = PledgeSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted to treasurer/admin.'}, status=403)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted.'}, status=403)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted.'}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not IsPastorOrAdmin().has_permission(request, self):
            return Response({'detail': 'Pastor or admin only.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class IncomeRecordViewSet(viewsets.ModelViewSet):
    queryset = IncomeRecord.objects.select_related('member').all()
    serializer_class = IncomeRecordSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def _check_finance_access(self, request):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted to treasurer/admin.'}, status=403)
        return None

    def list(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        qs = self.get_queryset()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not IsPastorOrAdmin().has_permission(request, self):
            return Response({'detail': 'Pastor or admin only.'}, status=403)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        err = self._check_finance_access(request)
        if err:
            return err
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        qs = IncomeRecord.objects.filter(date__month=month, date__year=year)
        totals = qs.aggregate(total=Sum('amount'))
        by_category = {
            item['category']: float(item['subtotal'])
            for item in qs.values('category').annotate(subtotal=Sum('amount'))
        }
        return Response({'month': month, 'year': year, 'total': float(totals['total'] or 0), 'by_category': by_category})


class ExpenseRecordViewSet(viewsets.ModelViewSet):
    queryset = ExpenseRecord.objects.all()
    serializer_class = ExpenseRecordSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def _check_finance_access(self, request):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted to treasurer/admin.'}, status=403)
        return None

    def list(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        qs = self.get_queryset()
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month:
            qs = qs.filter(date__month=month)
        if year:
            qs = qs.filter(date__year=year)
        return Response(self.get_serializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        err = self._check_finance_access(request)
        if err:
            return err
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not IsPastorOrAdmin().has_permission(request, self):
            return Response({'detail': 'Pastor or admin only.'}, status=403)
        return super().destroy(request, *args, **kwargs)


class FinancialSummaryViewSet(viewsets.ModelViewSet):
    queryset = FinancialSummary.objects.all()
    serializer_class = FinancialSummarySerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted to treasurer/admin.'}, status=403)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        if not is_treasurer_or_admin(request.user):
            return Response({'detail': 'Access restricted.'}, status=403)
        month = request.data.get('month', timezone.now().month)
        year = request.data.get('year', timezone.now().year)
        income_qs = IncomeRecord.objects.filter(date__month=month, date__year=year)
        expense_qs = ExpenseRecord.objects.filter(date__month=month, date__year=year)
        total_income = income_qs.aggregate(t=Sum('amount'))['t'] or 0
        total_tithe = income_qs.filter(category='tithe').aggregate(t=Sum('amount'))['t'] or 0
        total_offerings = income_qs.exclude(category='tithe').aggregate(t=Sum('amount'))['t'] or 0
        total_expenses = expense_qs.aggregate(t=Sum('amount'))['t'] or 0
        net = float(total_income) - float(total_expenses)

        summary, _ = FinancialSummary.objects.update_or_create(
            month=month, year=year,
            defaults={
                'total_income': total_income,
                'total_tithe': total_tithe,
                'total_offerings': total_offerings,
                'total_expenses': total_expenses,
                'net_balance': net,
            }
        )
        return Response(FinancialSummarySerializer(summary).data)
