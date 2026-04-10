/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// store
import type { EPageStoreType } from "@/qlcv-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageHeaderExtraActionsProps = {
  page: TPageInstance;
  storeType: EPageStoreType;
};

export function PageDetailsHeaderExtraActions(_props: TPageHeaderExtraActionsProps) {
  return null;
}
