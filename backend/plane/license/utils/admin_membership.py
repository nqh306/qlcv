"""Utilities to sync InstanceAdmin roles with WorkspaceMember records."""

from plane.db.models import Workspace, WorkspaceMember
from plane.license.models import InstanceAdmin, InstanceAdminWorkspace


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


def ensure_workspace_admin_membership(instance_admin, workspace):
    """Add a Workspace Admin as WorkspaceMember Admin in their scoped workspace."""
    if instance_admin.user:
        WorkspaceMember.objects.update_or_create(
            workspace=workspace,
            member=instance_admin.user,
            defaults={"role": 20, "is_active": True},
        )
