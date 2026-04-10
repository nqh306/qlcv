"""Utilities to sync Super Admin (InstanceAdmin role>=30) with WorkspaceMember records."""

from qlcv.db.models import Workspace, WorkspaceMember
from qlcv.license.models import InstanceAdmin


def ensure_super_admins_in_workspace(workspace):
    """Add all Super Admins (role>=30) as WorkspaceMember Admin in the given workspace."""
    super_admins = InstanceAdmin.objects.filter(role__gte=30).select_related("user")
    for admin in super_admins:
        if admin.user:
            WorkspaceMember.objects.update_or_create(
                workspace=workspace,
                member=admin.user,
                defaults={"role": 20, "is_active": True},
            )


def ensure_admin_in_all_workspaces(user):
    """Add a Super Admin to ALL workspaces as WorkspaceMember Admin."""
    for workspace in Workspace.objects.all():
        WorkspaceMember.objects.update_or_create(
            workspace=workspace,
            member=user,
            defaults={"role": 20, "is_active": True},
        )
