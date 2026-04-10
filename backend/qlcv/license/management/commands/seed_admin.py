# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only

# Python imports
import uuid

# Django imports
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone

# Module imports
from qlcv.license.models import Instance, InstanceAdmin, InstanceConfiguration
from qlcv.db.models import User, Profile, Workspace, WorkspaceMember


class Command(BaseCommand):
    help = "Seed default Super Admin user, workspace, and disable signup"

    def handle(self, *args, **options):
        # Check if instance exists
        instance = Instance.objects.first()
        if instance is None:
            self.stdout.write(self.style.WARNING("Instance not registered yet. Skipping seed."))
            return

        # Skip if setup is already done
        if instance.is_setup_done:
            self.stdout.write(self.style.SUCCESS("Instance already set up. Skipping seed."))
            return

        # Skip if an admin already exists
        if InstanceAdmin.objects.exists():
            self.stdout.write(self.style.SUCCESS("Admin already exists. Skipping seed."))
            return

        # --- 1. Create Super Admin user ---
        email = "admin@evngenco1.vn"
        password = "Admin@2026"
        display_name = "Super Admin"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "Super",
                "last_name": "Admin",
                "username": "admin",
                "password": make_password(password),
                "display_name": display_name,
                "is_active": True,
                "is_password_autoset": False,
                "is_email_verified": True,
                "last_active": timezone.now(),
                "last_login_time": timezone.now(),
                "token_updated_at": timezone.now(),
            },
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created Super Admin user: {email}"))
        else:
            self.stdout.write(self.style.WARNING(f"User {email} already exists."))

        # --- 2. Create Profile with onboarding completed ---
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={
                "company_name": "EVNGENCO1",
                "language": "vi-VN",
                "is_onboarded": True,
                "is_tour_completed": True,
                "onboarding_step": {
                    "profile_complete": True,
                    "workspace_create": True,
                    "workspace_invite": True,
                    "workspace_join": True,
                },
            },
        )
        if not profile.is_onboarded:
            profile.is_onboarded = True
            profile.onboarding_step = {
                "profile_complete": True,
                "workspace_create": True,
                "workspace_invite": True,
                "workspace_join": True,
            }
            profile.save()

        # --- 3. Create InstanceAdmin (Super Admin role=30) ---
        InstanceAdmin.objects.get_or_create(
            instance=instance,
            user=user,
            defaults={"role": 30},
        )
        self.stdout.write(self.style.SUCCESS("Assigned Instance Super Admin role."))

        # --- 4. Create Workspace "Cơ quan EVNGENCO1" ---
        workspace_slug = "co-quan-evngenco1"
        workspace, ws_created = Workspace.objects.get_or_create(
            slug=workspace_slug,
            defaults={
                "name": "Cơ quan EVNGENCO1",
                "owner": user,
                "organization_size": "100+",
            },
        )

        if ws_created:
            self.stdout.write(self.style.SUCCESS(f'Created workspace: "{workspace.name}"'))
            # Add user as workspace Admin (role=20)
            WorkspaceMember.objects.get_or_create(
                workspace=workspace,
                member=user,
                defaults={"role": 20},
            )
        else:
            self.stdout.write(self.style.WARNING(f'Workspace "{workspace.name}" already exists.'))

        # Update profile with last workspace
        profile.last_workspace_id = workspace.id
        profile.save(update_fields=["last_workspace_id"])

        # --- 5. Mark instance setup as done ---
        instance.is_setup_done = True
        instance.is_signup_screen_visited = True
        instance.instance_name = "EVNGENCO1"
        instance.is_telemetry_enabled = False
        instance.save()
        self.stdout.write(self.style.SUCCESS("Instance setup marked as done."))

        # --- 6. Disable self-signup ---
        config, _ = InstanceConfiguration.objects.get_or_create(
            key="ENABLE_SIGNUP",
            defaults={
                "value": "0",
                "category": "AUTHENTICATION",
                "is_encrypted": False,
            },
        )
        if config.value != "0":
            config.value = "0"
            config.save(update_fields=["value"])
        self.stdout.write(self.style.SUCCESS("Self-signup disabled (ENABLE_SIGNUP=0)."))

        self.stdout.write(self.style.SUCCESS("\n=== Seed completed ==="))
        self.stdout.write(self.style.SUCCESS(f"  Email:     {email}"))
        self.stdout.write(self.style.SUCCESS(f"  Password:  {password}"))
        self.stdout.write(self.style.SUCCESS(f"  Workspace: {workspace.name}"))
