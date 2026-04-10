/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// qlcv imports
import { useTranslation } from "@qlcv/i18n";
// components
import { PageWrapper } from "@/components/common/page-wrapper";
// types
import type { Route } from "./+types/page";
// local
import { WorkspaceCreateForm } from "./form";

const WorkspaceCreatePage = observer(function WorkspaceCreatePage(_props: Route.ComponentProps) {
  const { t } = useTranslation();
  return (
    <PageWrapper
      header={{
        title: t("admin.page.organizations.create_title"),
        description: t("admin.page.organizations.create_description"),
      }}
    >
      <WorkspaceCreateForm />
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "Create Organization - God Mode" }];

export default WorkspaceCreatePage;
