/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
import { CirclePlus, Mails } from "lucide-react";
import { observer } from "mobx-react";
// qlcv imports
import { useTranslation } from "@qlcv/i18n";
// components
import { SettingsSidebarItem } from "@/components/settings/sidebar/item";
import { WorkspaceLogo } from "@/components/workspace/logo";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// services
import { UserService } from "@/services/user.service";

const userService = new UserService();

export const ProfileSettingsSidebarWorkspaceOptions = observer(function ProfileSettingsSidebarWorkspaceOptions() {
  // store hooks
  const { workspaces } = useWorkspace();
  // translation
  const { t } = useTranslation();
  // state
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    userService
      .currentUserInstanceAdminStatus()
      .then((res) => setIsSuperAdmin(res.is_super_admin ?? false))
      .catch(() => setIsSuperAdmin(false));
  }, []);

  return (
    <div className="shrink-0">
      <div className="p-2 text-caption-md-medium text-tertiary capitalize">{t("workspace")}</div>
      <div className="flex flex-col">
        {Object.values(workspaces).map((workspace) => (
          <SettingsSidebarItem
            key={workspace.id}
            as="link"
            href={`/${workspace.slug}/`}
            iconNode={<WorkspaceLogo logo={workspace.logo_url} name={workspace.name} classNames="shrink-0" />}
            label={workspace.name}
            isActive={false}
          />
        ))}
        <div className="mt-1.5">
          {isSuperAdmin && (
            <SettingsSidebarItem
              as="link"
              href="/create-workspace/"
              icon={CirclePlus}
              label={t("create_workspace")}
              isActive={false}
            />
          )}
          <SettingsSidebarItem
            as="link"
            href="/invitations/"
            icon={Mails}
            label={t("workspace_invites")}
            isActive={false}
          />
        </div>
      </div>
    </div>
  );
});
