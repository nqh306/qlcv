/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { observer } from "mobx-react";
// qlcv imports
import type { TIssue, TIssueServiceType } from "@qlcv/types";
import { EIssueServiceType } from "@qlcv/types";
// QLCV-web imports
import type { TIssueRelationTypes } from "@/qlcv-web/types";
// local imports
import { RelationIssueListItem } from "./issue-list-item";

type Props = {
  workspaceSlug: string;
  issueId: string;
  issueIds: string[];
  relationKey: TIssueRelationTypes;
  handleIssueCrudState: (
    key: "update" | "delete" | "removeRelation",
    issueId: string,
    issue?: TIssue | null,
    relationKey?: TIssueRelationTypes | null,
    relationIssueId?: string | null
  ) => void;
  disabled?: boolean;
  issueServiceType?: TIssueServiceType;
};

export const RelationIssueList = observer(function RelationIssueList(props: Props) {
  const {
    workspaceSlug,
    issueId,
    issueIds,
    relationKey,
    disabled = false,
    handleIssueCrudState,
    issueServiceType = EIssueServiceType.ISSUES,
  } = props;

  return (
    <div className="relative">
      {issueIds &&
        issueIds.length > 0 &&
        issueIds.map((relationIssueId) => (
          <RelationIssueListItem
            key={relationIssueId}
            workspaceSlug={workspaceSlug}
            issueId={issueId}
            relationKey={relationKey}
            relationIssueId={relationIssueId}
            disabled={disabled}
            handleIssueCrudState={handleIssueCrudState}
            issueServiceType={issueServiceType}
          />
        ))}
    </div>
  );
});
