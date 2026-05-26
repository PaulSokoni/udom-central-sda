from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Member, Department, Group, Choir, UserRole
from .serializers import (
    MemberSerializer, MemberListSerializer, DepartmentSerializer,
    GroupSerializer, ChoirSerializer, UserRoleSerializer
)
from .utils import get_role, can_manage_roles
from .permissions import IsPastorOrAdmin, CanManageMembers


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]


class ChoirViewSet(viewsets.ModelViewSet):
    queryset = Choir.objects.all()
    serializer_class = ChoirSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.select_related('department').prefetch_related('groups', 'choirs')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'middle_name', 'member_id', 'phone', 'email']
    ordering_fields = ['last_name', 'first_name', 'membership_date', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_serializer_class(self):
        if self.action == 'list':
            return MemberListSerializer
        return MemberSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [CanManageMembers()]
        if self.action == 'destroy':
            return [IsPastorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Member.objects.all()
        status_filter = self.request.query_params.get('status')
        gender = self.request.query_params.get('gender')
        department = self.request.query_params.get('department')
        if status_filter:
            qs = qs.filter(membership_status=status_filter)
        if gender:
            qs = qs.filter(gender=gender)
        if department:
            qs = qs.filter(department_id=department)
        return qs

    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user.get_full_name() or self.request.user.username)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Member.objects.count()
        active = Member.objects.filter(membership_status='active').count()
        male = Member.objects.filter(gender='M', membership_status='active').count()
        female = Member.objects.filter(gender='F', membership_status='active').count()
        by_status = {s: Member.objects.filter(membership_status=s).count()
                     for s, _ in Member.STATUS_CHOICES}
        return Response({'total': total, 'active': active, 'male': male, 'female': female, 'by_status': by_status})

    @action(detail=False, methods=['get'])
    def locations(self, request):
        qs = Member.objects.filter(
            location_sharing=True,
            latitude__isnull=False,
            longitude__isnull=False,
        ).values(
            'id', 'member_id', 'first_name', 'middle_name', 'last_name',
            'phone', 'membership_status', 'latitude', 'longitude',
            'location_name', 'location_updated_at',
        )
        data = []
        for m in qs:
            m['full_name'] = ' '.join(filter(None, [m['first_name'], m['middle_name'], m['last_name']]))
            data.append(m)
        return Response(data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_location(self, request, pk=None):
        member = self.get_object()
        if not request.user.is_staff:
            if not hasattr(request.user, 'member_profile') or request.user.member_profile.pk != member.pk:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        location_name = request.data.get('location_name', '')
        sharing = request.data.get('location_sharing')

        if lat is not None: member.latitude = lat
        if lng is not None: member.longitude = lng
        if location_name is not None: member.location_name = location_name
        if sharing is not None: member.location_sharing = sharing
        if lat is not None and lng is not None:
            member.location_updated_at = timezone.now()

        member.save()
        return Response({
            'id': member.pk, 'latitude': str(member.latitude),
            'longitude': str(member.longitude), 'location_name': member.location_name,
            'location_sharing': member.location_sharing, 'location_updated_at': member.location_updated_at,
        })

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def my_location(self, request):
        try:
            member = request.user.member_profile
        except Exception:
            return Response({'detail': 'No member profile linked to your account.'}, status=status.HTTP_404_NOT_FOUND)

        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        location_name = request.data.get('location_name', '')
        sharing = request.data.get('location_sharing')

        if lat is not None: member.latitude = lat
        if lng is not None: member.longitude = lng
        if location_name is not None: member.location_name = location_name
        if sharing is not None: member.location_sharing = sharing
        if lat is not None and lng is not None:
            member.location_updated_at = timezone.now()

        member.save()
        return Response({
            'latitude': str(member.latitude), 'longitude': str(member.longitude),
            'location_name': member.location_name, 'location_sharing': member.location_sharing,
            'location_updated_at': member.location_updated_at,
        })


class UserRoleViewSet(viewsets.ViewSet):
    permission_classes = [IsPastorOrAdmin]

    def list(self, request):
        users = list(User.objects.select_related('role_profile').order_by('username'))

        # Bulk-create missing UserRole rows in a single query instead of N get_or_create calls
        existing_ids = {u.id for u in users if hasattr(u, 'role_profile') and u.role_profile is not None}
        missing = [u for u in users if u.id not in existing_ids]
        if missing:
            UserRole.objects.bulk_create(
                [UserRole(user=u) for u in missing],
                ignore_conflicts=True,
            )
            users = list(User.objects.select_related('role_profile').order_by('username'))

        role_choices = dict(UserRole.ROLE_CHOICES)
        data = []
        for u in users:
            try:
                role_obj = u.role_profile
            except Exception:
                role_obj = UserRole(user=u)
            effective_role = get_role(u)
            data.append({
                'user_id': u.id,
                'username': u.username,
                'full_name': u.get_full_name() or u.username,
                'email': u.email,
                'is_staff': u.is_staff,
                'role': role_obj.role,
                'role_display': role_choices.get(effective_role, effective_role),
            })
        return Response(data)

    def partial_update(self, request, pk=None):
        if not can_manage_roles(request.user):
            return Response({'detail': 'Only the pastor or admin can change user roles.'}, status=403)
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)

        role = request.data.get('role')
        if not role:
            return Response({'detail': 'role is required.'}, status=400)
        valid_roles = [r for r, _ in UserRole.ROLE_CHOICES]
        if role not in valid_roles:
            return Response({'detail': f'Invalid role. Choose from: {valid_roles}'}, status=400)

        role_obj, _ = UserRole.objects.get_or_create(user=target_user)
        current_role = role_obj.role

        # Only pastor can touch admin accounts (read, change, or assign the admin role)
        caller_is_pastor = get_role(request.user) == 'pastor'
        target_is_admin = current_role == 'admin' or target_user.is_staff
        assigning_admin = role == 'admin'

        if (target_is_admin or assigning_admin) and not caller_is_pastor:
            return Response(
                {'detail': 'Only the pastor can manage administrator accounts.'},
                status=403,
            )

        role_obj.role = role
        role_obj.save()
        return Response({'user_id': target_user.id, 'username': target_user.username, 'role': role})

    def destroy(self, request, pk=None):
        if get_role(request.user) != 'pastor':
            return Response({'detail': 'Only the pastor can delete user accounts.'}, status=403)
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=404)
        if target_user == request.user:
            return Response({'detail': 'You cannot delete your own account.'}, status=400)
        username = target_user.username
        target_user.delete()
        return Response({'detail': f'User "{username}" has been deleted.'}, status=200)
