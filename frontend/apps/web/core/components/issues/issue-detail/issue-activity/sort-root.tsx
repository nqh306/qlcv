/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { memo } from "react";
import { ArrowUpWideNarrow, ArrowDownWideNarrow } from "lucide-react";
// qlcv package imports
import { E_SORT_ORDER } from "@qlcv/constants";
import { IconButton } from "@qlcv/propel/icon-button";

export type TActivitySortRoot = {
  sortOrder: E_SORT_ORDER;
  toggleSort: () => void;
};
export const ActivitySortRoot = memo(function ActivitySortRoot(props: TActivitySortRoot) {
  const SortIcon = props.sortOrder === E_SORT_ORDER.ASC ? ArrowUpWideNarrow : ArrowDownWideNarrow;
  return <IconButton variant="tertiary" icon={SortIcon} onClick={props.toggleSort} />;
});

ActivitySortRoot.displayName = "ActivitySortRoot";
