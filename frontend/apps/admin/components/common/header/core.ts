/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

type TFn = (key: string) => string;

export function getCoreHeaderSegmentLabels(t: TFn): Record<string, string> {
  return {
    general: t("admin.sidebar.general"),
    ai: t("admin.sidebar.ai"),
    email: t("admin.sidebar.email"),
    authentication: t("admin.sidebar.authentication"),
    image: t("admin.sidebar.images"),
    google: "Google",
    github: "GitHub",
    gitlab: "GitLab",
    gitea: "Gitea",
    workspace: t("admin.sidebar.organizations"),
    organizations: t("admin.sidebar.organizations"),
    users: t("admin.sidebar.users"),
    create: t("admin.common.create"),
    import: t("admin.page.users.actions.import"),
  };
}
