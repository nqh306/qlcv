/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
import Link from "next/link";
import { useTheme as useNextTheme } from "next-themes";
// ui
import { useTranslation } from "@qlcv/i18n";
import { Button, getButtonStyling } from "@qlcv/propel/button";
import { resolveGeneralTheme } from "@qlcv/utils";
// hooks
import TakeoffIconDark from "@/app/assets/logos/takeoff-icon-dark.svg?url";
import TakeoffIconLight from "@/app/assets/logos/takeoff-icon-light.svg?url";
import { useTheme } from "@/hooks/store";
// icons

export const NewUserPopup = observer(function NewUserPopup() {
  // hooks
  const { isNewUserPopup, toggleNewUserPopup } = useTheme();
  const { t } = useTranslation();
  // theme
  const { resolvedTheme } = useNextTheme();

  if (!isNewUserPopup) return <></>;
  return (
    <div className="shadow-md absolute right-8 bottom-8 w-96 rounded-lg border border-subtle bg-surface-1 p-6">
      <div className="flex gap-4">
        <div className="grow">
          <div className="text-14 font-semibold">{t("admin.popup.welcome_title")}</div>
          <div className="py-2 text-13 font-medium text-tertiary">{t("admin.popup.welcome_description")}</div>
          <div className="flex items-center gap-4 pt-2">
            <Link href="/organizations/create" className={getButtonStyling("primary", "lg")}>
              {t("admin.popup.create_organization")}
            </Link>
            <Button variant="secondary" size="lg" onClick={toggleNewUserPopup}>
              {t("admin.common.close")}
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center">
          <img
            src={resolveGeneralTheme(resolvedTheme) === "dark" ? TakeoffIconDark : TakeoffIconLight}
            height={80}
            width={80}
            alt="QLCV icon"
          />
        </div>
      </div>
    </div>
  );
});
