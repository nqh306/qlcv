# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.urls import path

from plane.license.api.views import (
    EmailCredentialCheckEndpoint,
    InstanceAdminEndpoint,
    InstanceAdminSignInEndpoint,
    InstanceAdminSignUpEndpoint,
    InstanceConfigurationEndpoint,
    DisableEmailFeatureEndpoint,
    InstanceEndpoint,
    SignUpScreenVisitedEndpoint,
    InstanceAdminUserMeEndpoint,
    InstanceAdminSignOutEndpoint,
    InstanceAdminUserSessionEndpoint,
    InstanceWorkSpaceAvailabilityCheckEndpoint,
    InstanceWorkSpaceEndpoint,
    InstanceUserManagementEndpoint,
    InstanceBulkUserImportEndpoint,
    InstanceUserAvailabilityCheckEndpoint,
    InstanceUserProjectsEndpoint,
)

urlpatterns = [
    path("", InstanceEndpoint.as_view(), name="instance"),
    path("admins/", InstanceAdminEndpoint.as_view(), name="instance-admins"),
    path("admins/me/", InstanceAdminUserMeEndpoint.as_view(), name="instance-admins"),
    path(
        "admins/session/",
        InstanceAdminUserSessionEndpoint.as_view(),
        name="instance-admin-session",
    ),
    path(
        "admins/sign-out/",
        InstanceAdminSignOutEndpoint.as_view(),
        name="instance-admins",
    ),
    path("admins/<uuid:pk>/", InstanceAdminEndpoint.as_view(), name="instance-admins"),
    path(
        "configurations/",
        InstanceConfigurationEndpoint.as_view(),
        name="instance-configuration",
    ),
    path(
        "configurations/disable-email-feature/",
        DisableEmailFeatureEndpoint.as_view(),
        name="disable-email-configuration",
    ),
    path(
        "admins/sign-in/",
        InstanceAdminSignInEndpoint.as_view(),
        name="instance-admin-sign-in",
    ),
    path(
        "admins/sign-up/",
        InstanceAdminSignUpEndpoint.as_view(),
        name="instance-admin-sign-in",
    ),
    path(
        "admins/sign-up-screen-visited/",
        SignUpScreenVisitedEndpoint.as_view(),
        name="instance-sign-up",
    ),
    path(
        "email-credentials-check/",
        EmailCredentialCheckEndpoint.as_view(),
        name="email-credential-check",
    ),
    path(
        "workspace-slug-check/",
        InstanceWorkSpaceAvailabilityCheckEndpoint.as_view(),
        name="instance-workspace-availability",
    ),
    path("workspaces/", InstanceWorkSpaceEndpoint.as_view(), name="instance-workspace"),
    # User management
    path("users/", InstanceUserManagementEndpoint.as_view(), name="instance-users"),
    path("users/check-availability/", InstanceUserAvailabilityCheckEndpoint.as_view(), name="instance-user-availability"),
    path("users/bulk-import/", InstanceBulkUserImportEndpoint.as_view(), name="instance-users-bulk-import"),
    path("users/<uuid:pk>/", InstanceUserManagementEndpoint.as_view(), name="instance-user-detail"),
    path("users/<uuid:pk>/reset-password/", InstanceUserManagementEndpoint.as_view(), name="instance-user-reset-password"),
    path("users/<uuid:pk>/toggle-active/", InstanceUserManagementEndpoint.as_view(), name="instance-user-toggle-active"),
    path("users/<uuid:pk>/assign-workspace/", InstanceUserManagementEndpoint.as_view(), name="instance-user-assign-workspace"),
    path("users/<uuid:pk>/remove-workspace/<str:workspace_slug>/", InstanceUserManagementEndpoint.as_view(), name="instance-user-remove-workspace"),
    path("users/<uuid:pk>/assign-project/", InstanceUserManagementEndpoint.as_view(), name="instance-user-assign-project"),
    path("users/<uuid:pk>/set-admin-role/", InstanceUserManagementEndpoint.as_view(), name="instance-user-set-admin-role"),
    path("users/<uuid:pk>/projects/", InstanceUserProjectsEndpoint.as_view(), name="instance-user-projects"),
    path("users/<uuid:pk>/projects/<uuid:project_id>/", InstanceUserProjectsEndpoint.as_view(), name="instance-user-project-detail"),
]
