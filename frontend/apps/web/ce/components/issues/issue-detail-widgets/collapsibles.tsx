/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// qlcv types
import type { TIssueServiceType, TWorkItemWidgets } from "@qlcv/types";

export type TWorkItemAdditionalWidgetCollapsiblesProps = {
  disabled: boolean;
  hideWidgets: TWorkItemWidgets[];
  issueServiceType: TIssueServiceType;
  projectId: string;
  workItemId: string;
  workspaceSlug: string;
};

export function WorkItemAdditionalWidgetCollapsibles(_props: TWorkItemAdditionalWidgetCollapsiblesProps) {
  return null;
}
