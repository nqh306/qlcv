/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { observer } from "mobx-react";
// plane imports
import type { IWorkItemFilterInstance } from "@qlcv/shared-state";
import type { TWorkItemFilterExpression, TWorkItemFilterProperty } from "@qlcv/types";
// components
import type { TFiltersRowProps } from "@/components/rich-filters/filters-row";
import { FiltersRow } from "@/components/rich-filters/filters-row";

type TWorkItemFiltersRowProps = TFiltersRowProps<TWorkItemFilterProperty, TWorkItemFilterExpression> & {
  filter: IWorkItemFilterInstance;
};

export const WorkItemFiltersRow = observer(function WorkItemFiltersRow(props: TWorkItemFiltersRowProps) {
  return <FiltersRow {...props} />;
});
