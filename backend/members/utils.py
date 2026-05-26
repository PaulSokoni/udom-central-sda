def get_role(user):
    # UserRole assignment takes precedence — a staff user whose role is 'pastor' stays 'pastor'
    try:
        role = user.role_profile.role
        if role and role != 'member':
            return role
    except Exception:
        pass
    if user.is_staff:
        return 'admin'
    return 'member'


def has_role(user, *roles):
    return get_role(user) in roles


def is_super(user):
    """Pastor has the highest privilege, equal to or above system admin."""
    return user.is_staff or has_role(user, 'pastor')


def can_manage_members(user):
    return is_super(user) or has_role(user, 'secretary')


def can_view_all_prayers(user):
    return is_super(user) or has_role(user, 'elder')


def can_view_finance(user):
    return is_super(user) or has_role(user, 'treasurer')


def can_view_reports(user):
    return is_super(user) or has_role(user, 'secretary', 'elder')


def can_manage_roles(user):
    return is_super(user)
