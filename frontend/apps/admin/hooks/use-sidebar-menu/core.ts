/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Image, BrainCog, Cog, Mail, Users } from "lucide-react";
// plane imports
import { LockIcon, WorkspaceIcon } from "@qlcv/propel/icons";
// types
import type { TSidebarMenuItem } from "./types";

export type TCoreSidebarMenuKey = "general" | "email" | "organizations" | "authentication" | "ai" | "image" | "users";

type TFn = (key: string) => string;

export function getCoreSidebarMenuLinks(t: TFn): Record<TCoreSidebarMenuKey, TSidebarMenuItem> {
  return {
    general: {
      Icon: Cog,
      name: t("admin.sidebar.general"),
      description: t("admin.sidebar.descriptions.general"),
      href: `/general/`,
    },
    email: {
      Icon: Mail,
      name: t("admin.sidebar.email"),
      description: t("admin.sidebar.descriptions.email"),
      href: `/email/`,
    },
    organizations: {
      Icon: WorkspaceIcon,
      name: t("admin.sidebar.organizations"),
      description: t("admin.sidebar.descriptions.organizations"),
      href: `/organizations/`,
    },
    authentication: {
      Icon: LockIcon,
      name: t("admin.sidebar.authentication"),
      description: t("admin.sidebar.descriptions.authentication"),
      href: `/authentication/`,
    },
    ai: {
      Icon: BrainCog,
      name: t("admin.sidebar.ai"),
      description: t("admin.sidebar.descriptions.ai"),
      href: `/ai/`,
    },
    image: {
      Icon: Image,
      name: t("admin.sidebar.images"),
      description: t("admin.sidebar.descriptions.images"),
      href: `/image/`,
    },
    users: {
      Icon: Users,
      name: t("admin.sidebar.users"),
      description: t("admin.sidebar.descriptions.users"),
      href: `/users/`,
    },
  };
}
