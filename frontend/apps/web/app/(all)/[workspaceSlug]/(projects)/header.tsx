/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import { Shapes } from "lucide-react";
// qlcv imports
import { useTranslation } from "@qlcv/i18n";
import { Button } from "@qlcv/propel/button";
import { HomeIcon } from "@qlcv/propel/icons";
import { Breadcrumbs, Header } from "@qlcv/ui";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// hooks
import { useHome } from "@/hooks/store/use-home";

export const WorkspaceDashboardHeader = observer(function WorkspaceDashboardHeader() {
  // qlcv hooks
  const { t } = useTranslation();
  // hooks
  const { toggleWidgetSettings } = useHome();

  return (
    <>
      <Header>
        <Header.LeftItem>
          <div className="flex items-center gap-2">
            <Breadcrumbs>
              <Breadcrumbs.Item
                component={
                  <BreadcrumbLink label={t("home.title")} icon={<HomeIcon className="h-4 w-4 text-tertiary" />} />
                }
              />
            </Breadcrumbs>
          </div>
        </Header.LeftItem>
        <Header.RightItem>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => toggleWidgetSettings(true)}
            className="my-auto mb-0"
            prependIcon={<Shapes />}
          >
            <div className="hidden sm:hidden md:block">{t("home.manage_widgets")}</div>
          </Button>
        </Header.RightItem>
      </Header>
    </>
  );
});
