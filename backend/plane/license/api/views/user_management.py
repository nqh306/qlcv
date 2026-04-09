# Python imports
import csv
import io
import re
import uuid

# Django imports
from django.contrib.auth.hashers import make_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Count, Q

# Third party imports
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

# Module imports
from .base import BaseAPIView
from plane.license.api.permissions import InstanceAdminOrScopedPermission, InstanceAdminPermission
from plane.license.api.serializers import InstanceUserListSerializer, InstanceUserDetailSerializer
from plane.license.models import Instance, InstanceAdmin, InstanceAdminWorkspace
from plane.license.utils.admin_membership import ensure_admin_in_all_workspaces, ensure_workspace_admin_membership
from plane.db.models import User, Profile, Workspace, WorkspaceMember, Project, ProjectMember

USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9._-]+$")


def get_scoped_workspace_ids(instance_admin):
    """Get workspace IDs that a Workspace Admin is scoped to. Returns None for Super Admin."""
    if instance_admin.role >= 30:
        return None  # Super Admin — no scope restriction
    return list(
        InstanceAdminWorkspace.objects.filter(
            instance_admin=instance_admin
        ).values_list("workspace_id", flat=True)
    )


def get_scoped_user_ids(scoped_workspace_ids):
    """Get user IDs that belong to the given workspaces."""
    return WorkspaceMember.objects.filter(
        workspace_id__in=scoped_workspace_ids, is_active=True
    ).values_list("member_id", flat=True).distinct()


class InstanceUserManagementEndpoint(BaseAPIView):
    permission_classes = [InstanceAdminOrScopedPermission]

    def get(self, request, pk=None):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        # Single user detail
        if pk:
            user = User.objects.filter(pk=pk).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Workspace Admin: check user is in scope
            if scoped_ws_ids is not None:
                if not WorkspaceMember.objects.filter(
                    member=user, workspace_id__in=scoped_ws_ids, is_active=True
                ).exists():
                    return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

            serializer = InstanceUserDetailSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # List users
        users = User.objects.filter(is_bot=False).annotate(
            workspace_count=Count(
                "member_workspace",
                filter=Q(member_workspace__is_active=True),
            )
        )

        # Workspace Admin: filter to scoped users only
        if scoped_ws_ids is not None:
            scoped_user_ids = get_scoped_user_ids(scoped_ws_ids)
            users = users.filter(id__in=scoped_user_ids)

        # Optional workspace filter
        workspace_slug = request.query_params.get("workspace", None)
        if workspace_slug:
            ws_user_ids = WorkspaceMember.objects.filter(
                workspace__slug=workspace_slug, is_active=True
            ).values_list("member_id", flat=True)
            users = users.filter(id__in=ws_user_ids)

        # Search
        search = request.query_params.get("search", None)
        if search:
            users = users.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(display_name__icontains=search)
            )

        # Ordering
        users = users.order_by("-date_joined")

        return self.paginate(
            request=request,
            queryset=users,
            on_results=lambda results: InstanceUserListSerializer(results, many=True).data,
            max_per_page=50,
            default_per_page=20,
        )

    @transaction.atomic
    def post(self, request, pk=None):
        # Route to specific actions based on URL name
        if pk:
            url_name = request.resolver_match.url_name
            if url_name == "instance-user-reset-password":
                return self._reset_password(request, pk)
            elif url_name == "instance-user-toggle-active":
                return self._toggle_active(request, pk)
            elif url_name == "instance-user-assign-workspace":
                return self._assign_workspace(request, pk)
            elif url_name == "instance-user-assign-project":
                return self._assign_project(request, pk)
            elif url_name == "instance-user-set-admin-role":
                return self._set_admin_role(request, pk)
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

        # Create new user
        return self._create_user(request)

    def patch(self, request, pk):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workspace Admin: check user is in scope
        if scoped_ws_ids is not None:
            if not WorkspaceMember.objects.filter(
                member=user, workspace_id__in=scoped_ws_ids, is_active=True
            ).exists():
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        # Only allow updating specific fields
        allowed_fields = {"first_name", "last_name", "display_name", "username"}
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        if not update_data:
            return Response({"error": "No valid fields to update"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate username if being updated
        if "username" in update_data:
            new_username = update_data["username"].strip().lower()
            if not USERNAME_REGEX.match(new_username):
                return Response(
                    {"error": "Username can only contain letters, numbers, dots, hyphens, and underscores"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if len(new_username) < 3 or len(new_username) > 64:
                return Response({"error": "Username must be 3-64 characters"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.filter(username=new_username).exclude(pk=pk).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_409_CONFLICT)
            update_data["username"] = new_username

        for key, value in update_data.items():
            setattr(user, key, value)
        user.save(update_fields=list(update_data.keys()))

        serializer = InstanceUserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk, workspace_slug=None):
        """Remove user from a workspace."""
        if not workspace_slug:
            return Response({"error": "Workspace slug is required"}, status=status.HTTP_400_BAD_REQUEST)

        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        # Workspace Admin: check workspace is in scope
        if scoped_ws_ids is not None:
            workspace = Workspace.objects.filter(slug=workspace_slug, id__in=scoped_ws_ids).first()
            if not workspace:
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)
        else:
            workspace = Workspace.objects.filter(slug=workspace_slug).first()
            if not workspace:
                return Response({"error": "Workspace not found"}, status=status.HTTP_404_NOT_FOUND)

        WorkspaceMember.objects.filter(member_id=pk, workspace=workspace).update(is_active=False)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _create_user(self, request):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        username = request.data.get("username", "").strip().lower()
        email = request.data.get("email", "").strip().lower()
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        workspace_slugs = request.data.get("workspace_slugs", [])
        workspace_role = request.data.get("role", 15)  # Default: Member

        # Validate username
        if not username:
            return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not USERNAME_REGEX.match(username):
            return Response(
                {"error": "Username can only contain letters, numbers, dots, hyphens, and underscores"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(username) < 3 or len(username) > 64:
            return Response({"error": "Username must be 3-64 characters"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=status.HTTP_409_CONFLICT)

        # Validate email
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_email(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists"}, status=status.HTTP_409_CONFLICT)

        # Validate workspaces
        workspaces = Workspace.objects.filter(slug__in=workspace_slugs)
        if workspace_slugs and workspaces.count() != len(workspace_slugs):
            found_slugs = set(workspaces.values_list("slug", flat=True))
            missing = [s for s in workspace_slugs if s not in found_slugs]
            return Response(
                {"error": f"Workspace(s) not found: {', '.join(missing)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if scoped_ws_ids is not None:
            # Workspace Admin must assign at least one workspace
            if not workspace_slugs:
                return Response(
                    {"error": "At least one workspace is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if workspaces.exclude(id__in=scoped_ws_ids).exists():
                return Response(
                    {"error": "You can only assign users to your scoped workspaces"},
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Generate temp password
        temp_password = User.objects.make_random_password(length=12)

        # Create user
        user = User.objects.create(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            display_name=User.get_display_name(email) if not first_name else f"{first_name} {last_name}".strip(),
            password=make_password(temp_password),
            is_password_autoset=True,
            is_password_reset_required=True,
            is_active=True,
        )

        # Create profile
        Profile.objects.create(user=user)

        # Add to workspaces
        for ws in workspaces:
            WorkspaceMember.objects.create(
                workspace=ws,
                member=user,
                role=workspace_role,
            )

        serializer = InstanceUserDetailSerializer(user)
        return Response(
            {"user": serializer.data, "temp_password": temp_password},
            status=status.HTTP_201_CREATED,
        )

    def _reset_password(self, request, pk):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workspace Admin: check user is in scope
        if scoped_ws_ids is not None:
            if not WorkspaceMember.objects.filter(
                member=user, workspace_id__in=scoped_ws_ids, is_active=True
            ).exists():
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        temp_password = User.objects.make_random_password(length=12)
        user.set_password(temp_password)
        user.is_password_autoset = True
        user.is_password_reset_required = True
        user.save(update_fields=["password", "is_password_autoset", "is_password_reset_required"])

        return Response({"temp_password": temp_password}, status=status.HTTP_200_OK)

    def _toggle_active(self, request, pk):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if scoped_ws_ids is not None:
            if not WorkspaceMember.objects.filter(
                member=user, workspace_id__in=scoped_ws_ids, is_active=True
            ).exists():
                return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        user.is_active = not user.is_active
        user.save(update_fields=["is_active"])

        serializer = InstanceUserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _assign_workspace(self, request, pk):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        workspace_slug = request.data.get("workspace_slug")
        role = request.data.get("role", 15)

        workspace = Workspace.objects.filter(slug=workspace_slug).first()
        if not workspace:
            return Response({"error": "Workspace not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workspace Admin: check workspace is in scope
        if scoped_ws_ids is not None and workspace.id not in scoped_ws_ids:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        member, created = WorkspaceMember.objects.update_or_create(
            workspace=workspace,
            member=user,
            defaults={"role": role, "is_active": True},
        )

        return Response({"status": "assigned"}, status=status.HTTP_200_OK)

    def _set_admin_role(self, request, pk):
        """Promote/demote user admin role. Only Super Admin can do this."""
        instance_admin = request.instance_admin
        if instance_admin.role < 30:
            return Response({"error": "Only Super Admin can manage admin roles"}, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Prevent self-demotion
        if user == request.user:
            return Response({"error": "Cannot change your own admin role"}, status=status.HTTP_400_BAD_REQUEST)

        new_role = request.data.get("role")  # 30, 20, or null (remove admin)
        workspace_ids = request.data.get("workspace_ids", [])

        instance = Instance.objects.first()
        existing_admin = InstanceAdmin.objects.filter(instance=instance, user=user).first()

        # Remove admin
        if new_role is None or new_role == 0:
            if existing_admin:
                InstanceAdminWorkspace.objects.filter(instance_admin=existing_admin).delete()
                existing_admin.delete()
            return Response({"status": "admin_removed"}, status=status.HTTP_200_OK)

        if new_role not in [20, 30]:
            return Response({"error": "Invalid role. Use 30 (Super Admin), 20 (Workspace Admin), or null (remove)"}, status=status.HTTP_400_BAD_REQUEST)

        if existing_admin:
            # Update existing admin role
            old_role = existing_admin.role
            existing_admin.role = new_role
            existing_admin.save(update_fields=["role"])

            # Clean up old workspace scopes
            InstanceAdminWorkspace.objects.filter(instance_admin=existing_admin).delete()

            if new_role >= 30:
                # Super Admin → add to all workspaces
                ensure_admin_in_all_workspaces(user)
            elif new_role == 20 and workspace_ids:
                # Workspace Admin → create new scopes
                for ws in Workspace.objects.filter(id__in=workspace_ids):
                    InstanceAdminWorkspace.objects.create(instance_admin=existing_admin, workspace=ws)
                    ensure_workspace_admin_membership(existing_admin, ws)
        else:
            # Create new admin
            new_admin = InstanceAdmin.objects.create(instance=instance, user=user, role=new_role)

            if new_role >= 30:
                ensure_admin_in_all_workspaces(user)
            elif new_role == 20 and workspace_ids:
                for ws in Workspace.objects.filter(id__in=workspace_ids):
                    InstanceAdminWorkspace.objects.create(instance_admin=new_admin, workspace=ws)
                    ensure_workspace_admin_membership(new_admin, ws)

        serializer = InstanceUserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def _assign_project(self, request, pk):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        project_id = request.data.get("project_id")
        role = request.data.get("role", 15)  # Default: Member

        project = Project.objects.filter(id=project_id).first()
        if not project:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        # Workspace Admin: check project's workspace is in scope
        if scoped_ws_ids is not None and project.workspace_id not in scoped_ws_ids:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        # Ensure user is a workspace member first and validate role hierarchy
        ws_member = WorkspaceMember.objects.filter(
            workspace=project.workspace, member=user, is_active=True
        ).first()
        if not ws_member:
            return Response(
                {"error": "User must be a workspace member first"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Project role cannot exceed workspace role
        if role > ws_member.role:
            return Response(
                {"error": f"Project role ({role}) cannot exceed workspace role ({ws_member.role})"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ProjectMember.objects.update_or_create(
            project=project,
            member=user,
            defaults={"role": role, "is_active": True, "workspace": project.workspace},
        )

        return Response({"status": "assigned"}, status=status.HTTP_200_OK)


class InstanceUserProjectsEndpoint(BaseAPIView):
    """List projects in a workspace (for project assignment dropdown) + remove user from project."""
    permission_classes = [InstanceAdminOrScopedPermission]

    def get(self, request, pk):
        """List projects user is/can be in, for a given workspace."""
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        workspace_slug = request.query_params.get("workspace")
        if not workspace_slug:
            return Response({"error": "workspace query param required"}, status=status.HTTP_400_BAD_REQUEST)

        workspace = Workspace.objects.filter(slug=workspace_slug).first()
        if not workspace:
            return Response({"error": "Workspace not found"}, status=status.HTTP_404_NOT_FOUND)

        if scoped_ws_ids is not None and workspace.id not in scoped_ws_ids:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        projects = Project.objects.filter(workspace=workspace).values("id", "name", "identifier", "network")

        # Get user's current project memberships in this workspace
        user_project_ids = set(
            ProjectMember.objects.filter(
                member_id=pk, workspace=workspace, is_active=True
            ).values_list("project_id", flat=True)
        )

        result = []
        for p in projects:
            result.append({
                "id": str(p["id"]),
                "name": p["name"],
                "identifier": p["identifier"],
                "is_member": p["id"] in user_project_ids,
            })

        return Response(result, status=status.HTTP_200_OK)

    def delete(self, request, pk, project_id=None):
        """Remove user from a project."""
        if not project_id:
            return Response({"error": "Project ID required"}, status=status.HTTP_400_BAD_REQUEST)

        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        project = Project.objects.filter(id=project_id).first()
        if not project:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        if scoped_ws_ids is not None and project.workspace_id not in scoped_ws_ids:
            return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

        ProjectMember.objects.filter(member_id=pk, project=project).update(is_active=False)
        return Response(status=status.HTTP_204_NO_CONTENT)


class InstanceBulkUserImportEndpoint(BaseAPIView):
    permission_classes = [InstanceAdminOrScopedPermission]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def post(self, request):
        instance_admin = request.instance_admin
        scoped_ws_ids = get_scoped_workspace_ids(instance_admin)

        file = request.FILES.get("file")
        if not file:
            return Response({"error": "File is required"}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()

        # Parse file
        rows = []
        if filename.endswith(".csv"):
            rows = self._parse_csv(file)
        elif filename.endswith(".xlsx"):
            rows = self._parse_xlsx(file)
        else:
            return Response(
                {"error": "Unsupported file format. Use .csv or .xlsx"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not rows:
            return Response({"error": "File is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate and create
        created = 0
        errors = []

        for i, row in enumerate(rows, start=2):  # Row 2 onwards (row 1 = header)
            username = row.get("username", "").strip().lower()
            email = row.get("email", "").strip().lower()
            first_name = row.get("first_name", "").strip()
            last_name = row.get("last_name", "").strip()
            workspace_slug = row.get("workspace_slug", "").strip()
            role_str = row.get("role", "15").strip()

            try:
                role = int(role_str)
            except (ValueError, TypeError):
                role = 15

            # Validate username
            if not username:
                username = uuid.uuid4().hex[:16]
            if not USERNAME_REGEX.match(username):
                errors.append({"row": i, "email": email, "error": f"Invalid username '{username}'"})
                continue
            if User.objects.filter(username=username).exists():
                errors.append({"row": i, "email": email, "error": f"Username '{username}' already taken"})
                continue

            # Validate email
            if not email:
                errors.append({"row": i, "email": email, "error": "Email is required"})
                continue

            try:
                validate_email(email)
            except ValidationError:
                errors.append({"row": i, "email": email, "error": "Invalid email format"})
                continue

            if User.objects.filter(email=email).exists():
                errors.append({"row": i, "email": email, "error": "User already exists"})
                continue

            # Validate workspace
            workspace = Workspace.objects.filter(slug=workspace_slug).first()
            if not workspace:
                errors.append({"row": i, "email": email, "error": f"Workspace '{workspace_slug}' not found"})
                continue

            if scoped_ws_ids is not None and workspace.id not in scoped_ws_ids:
                errors.append({"row": i, "email": email, "error": "Not authorized for this workspace"})
                continue

            # Create user
            temp_password = User.objects.make_random_password(length=12)
            user = User.objects.create(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                display_name=f"{first_name} {last_name}".strip() if first_name else User.get_display_name(email),
                password=make_password(temp_password),
                is_password_autoset=True,
                is_password_reset_required=True,
                is_active=True,
            )
            Profile.objects.create(user=user)
            WorkspaceMember.objects.create(workspace=workspace, member=user, role=role)
            created += 1

        return Response(
            {"created": created, "errors": errors},
            status=status.HTTP_200_OK,
        )

    def _parse_csv(self, file):
        decoded = file.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(decoded))
        return list(reader)

    def _parse_xlsx(self, file):
        import openpyxl

        wb = openpyxl.load_workbook(file, read_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            return []

        headers = [str(h).strip().lower() if h else "" for h in rows[0]]
        result = []
        for row in rows[1:]:
            row_dict = {}
            for j, header in enumerate(headers):
                row_dict[header] = str(row[j]).strip() if j < len(row) and row[j] is not None else ""
            result.append(row_dict)
        return result


class InstanceUserAvailabilityCheckEndpoint(BaseAPIView):
    permission_classes = [InstanceAdminPermission]

    def get(self, request):
        username = request.query_params.get("username", "").strip().lower()
        email = request.query_params.get("email", "").strip().lower()

        if username:
            if not USERNAME_REGEX.match(username) or len(username) < 3 or len(username) > 64:
                return Response({"available": False, "error": "Invalid username format"}, status=status.HTTP_200_OK)
            available = not User.objects.filter(username=username).exists()
            return Response({"available": available}, status=status.HTTP_200_OK)

        if email:
            try:
                validate_email(email)
            except ValidationError:
                return Response({"available": False, "error": "Invalid email format"}, status=status.HTTP_200_OK)
            available = not User.objects.filter(email=email).exists()
            return Response({"available": available}, status=status.HTTP_200_OK)

        return Response({"error": "Provide username or email"}, status=status.HTTP_400_BAD_REQUEST)
