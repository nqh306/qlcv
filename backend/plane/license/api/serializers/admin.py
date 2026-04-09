# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

# Third party imports
from rest_framework import serializers

# Module imports
from .base import BaseSerializer
from plane.db.models import User, WorkspaceMember, ProjectMember
from plane.app.serializers import UserAdminLiteSerializer
from plane.license.models import InstanceAdmin, InstanceAdminWorkspace


class InstanceAdminMeSerializer(BaseSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "avatar",
            "avatar_url",
            "cover_image",
            "date_joined",
            "display_name",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_bot",
            "is_email_verified",
            "user_timezone",
            "username",
            "is_password_autoset",
        ]
        read_only_fields = fields


class InstanceAdminSerializer(BaseSerializer):
    user_detail = UserAdminLiteSerializer(source="user", read_only=True)

    class Meta:
        model = InstanceAdmin
        fields = "__all__"
        read_only_fields = ["id", "instance", "user"]


class AdminRoleMixin:
    """Adds admin_role and admin_scoped_workspaces to user serializer."""

    _admin_info_cache = None

    def _get_admin_info(self, user):
        # Cache per-instance to avoid duplicate queries for admin_role + admin_scoped_workspaces
        cache_key = f"_admin_info_{user.id}"
        cached = getattr(self, cache_key, None)
        if cached is not None:
            return cached

        admin = InstanceAdmin.objects.filter(user=user).first()
        if not admin:
            result = (None, [])
        else:
            scoped = []
            if admin.role == 20:
                scoped = list(
                    InstanceAdminWorkspace.objects.filter(
                        instance_admin=admin
                    ).select_related("workspace").values_list("workspace__name", flat=True)
                )
            result = (admin.role, scoped)

        setattr(self, cache_key, result)
        return result


class InstanceUserListSerializer(AdminRoleMixin, BaseSerializer):
    workspace_count = serializers.IntegerField(read_only=True, default=0)
    admin_role = serializers.SerializerMethodField()
    admin_scoped_workspaces = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "display_name",
            "is_active",
            "is_email_verified",
            "date_joined",
            "last_active",
            "last_login_time",
            "avatar_url",
            "is_password_autoset",
            "is_password_reset_required",
            "workspace_count",
            "admin_role",
            "admin_scoped_workspaces",
        ]
        read_only_fields = fields

    def get_admin_role(self, obj):
        role, _ = self._get_admin_info(obj)
        return role

    def get_admin_scoped_workspaces(self, obj):
        _, scoped = self._get_admin_info(obj)
        return scoped


class UserWorkspaceMembershipSerializer(serializers.Serializer):
    workspace_id = serializers.UUIDField(source="workspace.id")
    workspace_name = serializers.CharField(source="workspace.name")
    workspace_slug = serializers.CharField(source="workspace.slug")
    role = serializers.IntegerField()
    is_active = serializers.BooleanField()


class UserProjectMembershipSerializer(serializers.Serializer):
    project_id = serializers.UUIDField(source="project.id")
    project_name = serializers.CharField(source="project.name")
    project_identifier = serializers.CharField(source="project.identifier")
    workspace_slug = serializers.CharField(source="workspace.slug")
    role = serializers.IntegerField()
    is_active = serializers.BooleanField()


class InstanceUserDetailSerializer(AdminRoleMixin, BaseSerializer):
    workspace_memberships = serializers.SerializerMethodField()
    project_memberships = serializers.SerializerMethodField()
    admin_role = serializers.SerializerMethodField()
    admin_scoped_workspaces = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "display_name",
            "is_active",
            "is_email_verified",
            "date_joined",
            "last_active",
            "last_login_time",
            "avatar_url",
            "is_password_autoset",
            "is_password_reset_required",
            "mobile_number",
            "user_timezone",
            "workspace_memberships",
            "project_memberships",
            "admin_role",
            "admin_scoped_workspaces",
        ]
        read_only_fields = fields

    def get_admin_role(self, obj):
        role, _ = self._get_admin_info(obj)
        return role

    def get_admin_scoped_workspaces(self, obj):
        _, scoped = self._get_admin_info(obj)
        return scoped

    def get_workspace_memberships(self, obj):
        memberships = WorkspaceMember.objects.filter(
            member=obj, is_active=True
        ).select_related("workspace")
        return UserWorkspaceMembershipSerializer(memberships, many=True).data

    def get_project_memberships(self, obj):
        memberships = ProjectMember.objects.filter(
            member=obj, is_active=True
        ).select_related("project", "workspace")
        return UserProjectMembershipSerializer(memberships, many=True).data
