/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// qlcv imports
import { API_BASE_URL } from "@qlcv/constants";
import type { IIssueLabel } from "@qlcv/types";
// api service
import { APIService } from "../api.service";

/**
 * Service class for managing labels within qlcv sites application.
 * Extends APIService to handle HTTP requests to the label-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for QLCV sites
 */
export class SitesLabelService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Retrieves a list of labels for a specific anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<IIssueLabel[]>} The list of labels
   * @throws {Error} If the API request fails
   */
  async list(anchor: string): Promise<IIssueLabel[]> {
    return this.get(`/api/public/anchor/${anchor}/labels/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
