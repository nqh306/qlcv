/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane imports
import type { IWorkspace } from "@qlcv/types";

export const orderWorkspacesList = (workspaces: IWorkspace[]): IWorkspace[] =>
  workspaces.sort((a, b) => a.name.localeCompare(b.name));
