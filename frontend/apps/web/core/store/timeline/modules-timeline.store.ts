/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { autorun } from "mobx";
// Store
import type { RootStore } from "@/qlcv-web/store/root.store";
import { BaseTimeLineStore } from "@/qlcv-web/store/timeline/base-timeline.store";
import type { IBaseTimelineStore } from "@/qlcv-web/store/timeline/base-timeline.store";

export interface IModulesTimeLineStore extends IBaseTimelineStore {
  isDependencyEnabled: boolean;
}

export class ModulesTimeLineStore extends BaseTimeLineStore implements IModulesTimeLineStore {
  constructor(_rootStore: RootStore) {
    super(_rootStore);

    autorun(() => {
      const getModuleById = this.rootStore.module.getModuleById;
      this.updateBlocks(getModuleById);
    });
  }
}
