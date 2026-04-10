/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useTranslation } from "@qlcv/i18n";
import type { TInstanceAuthenticationModes } from "@qlcv/types";
import { getCoreAuthenticationModesMap } from "./core";
import type { TGetAuthenticationModeProps } from "./types";

export const useAuthenticationModes = (props: TGetAuthenticationModeProps): TInstanceAuthenticationModes[] => {
  const { t } = useTranslation();
  // derived values
  const authenticationModes = getCoreAuthenticationModesMap(props, t);

  const availableAuthenticationModes: TInstanceAuthenticationModes[] = [
    authenticationModes["unique-codes"],
    authenticationModes["passwords-login"],
    authenticationModes["google"],
    authenticationModes["github"],
    authenticationModes["gitlab"],
    authenticationModes["gitea"],
  ];

  return availableAuthenticationModes;
};
