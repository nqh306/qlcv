/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Logger as HocuspocusLogger } from "@hocuspocus/extension-logger";
import { logger } from "@qlcv/logger";

export class Logger extends HocuspocusLogger {
  constructor() {
    super({
      onChange: false,
      log: (message) => {
        logger.info(message);
      },
    });
  }
}
