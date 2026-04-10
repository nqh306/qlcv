/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useContext } from "react";
import type { TIssueServiceType } from "@qlcv/types";
import { EIssueServiceType } from "@qlcv/types";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import type { IIssueDetail } from "@/qlcv-web/store/issue/issue-details/root.store";

export const useIssueDetail = (serviceType: TIssueServiceType = EIssueServiceType.ISSUES): IIssueDetail => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useIssueDetail must be used within StoreProvider");
  if (serviceType === EIssueServiceType.EPICS) return context.issue.epicDetail;
  else return context.issue.issueDetail;
};
