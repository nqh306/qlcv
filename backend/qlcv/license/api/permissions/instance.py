# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework.permissions import BasePermission

# Module imports
from qlcv.license.models import Instance, InstanceAdmin
from qlcv.db.models import WorkspaceMember


def _is_god_mode_user(user):
    """Check if user can access God Mode: Super Admin (InstanceAdmin role>=30) or Workspace Admin (WorkspaceMember role=20)."""
    instance = Instance.objects.first()
    if InstanceAdmin.objects.filter(instance=instance, user=user, role__gte=30).exists():
        return True
    return WorkspaceMember.objects.filter(member=user, role=20, is_active=True).exists()


def _is_super_admin(user):
    """Check if user is Super Admin (InstanceAdmin role>=30)."""
    instance = Instance.objects.first()
    return InstanceAdmin.objects.filter(instance=instance, user=user, role__gte=30).exists()


class InstanceAdminPermission(BasePermission):
    """Allow access to God Mode for Super Admin or any Workspace Admin (WorkspaceMember role=20)."""

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        return _is_god_mode_user(request.user)


class InstanceSuperAdminPermission(BasePermission):
    """Only Super Admins (InstanceAdmin role >= 30) can access."""

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False
        return _is_super_admin(request.user)


class InstanceAdminOrScopedPermission(BasePermission):
    """
    Super Admin: full access to all resources.
    Workspace Admin (WorkspaceMember role=20): access scoped to their admin workspaces.
    Attaches request.is_super_admin and request.scoped_workspace_ids for use in views.
    """

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        # Check Super Admin first
        if _is_super_admin(request.user):
            request.is_super_admin = True
            request.scoped_workspace_ids = None  # No scope restriction
            return True

        # Check Workspace Admin (WorkspaceMember role=20)
        admin_ws_ids = list(
            WorkspaceMember.objects.filter(
                member=request.user, role=20, is_active=True
            ).values_list("workspace_id", flat=True)
        )
        if admin_ws_ids:
            request.is_super_admin = False
            request.scoped_workspace_ids = admin_ws_ids
            return True

        return False
