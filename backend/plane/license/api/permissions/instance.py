# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework.permissions import BasePermission

# Module imports
from plane.license.models import Instance, InstanceAdmin


class InstanceAdminPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        instance = Instance.objects.first()
        return InstanceAdmin.objects.filter(role__gte=15, instance=instance, user=request.user).exists()


class InstanceSuperAdminPermission(BasePermission):
    """Only Super Admins (role >= 30) can access."""

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        instance = Instance.objects.first()
        return InstanceAdmin.objects.filter(role__gte=30, instance=instance, user=request.user).exists()


class InstanceAdminOrScopedPermission(BasePermission):
    """
    Super Admin: full access to all resources.
    Workspace Admin: access scoped to their assigned workspaces.
    Attaches request.instance_admin for use in views.
    """

    def has_permission(self, request, view):
        if request.user.is_anonymous:
            return False

        instance = Instance.objects.first()
        admin = InstanceAdmin.objects.filter(instance=instance, user=request.user).first()
        if not admin:
            return False

        request.instance_admin = admin
        return True
