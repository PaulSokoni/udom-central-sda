from rest_framework.permissions import BasePermission
from .utils import is_super, can_manage_members


class IsPastorOrAdmin(BasePermission):
    """Grants access to pastor (highest privilege) and staff admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and is_super(request.user)
        )


class IsStaffAdmin(BasePermission):
    """Grants access only to staff/superuser admins (not pastors)."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class CanManageMembers(BasePermission):
    """Pastor, admin, and secretary can register/edit members."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and can_manage_members(request.user)
        )
