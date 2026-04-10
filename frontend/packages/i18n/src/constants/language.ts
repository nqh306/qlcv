/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import type { TLanguage, ILanguageOption } from "../types";

export const FALLBACK_LANGUAGE: TLanguage = "en";
export const DEFAULT_LANGUAGE: TLanguage = "vi-VN";

export const SUPPORTED_LANGUAGES: ILanguageOption[] = [
  { label: "Tiếng Việt", value: "vi-VN" },
  { label: "English", value: "en" },
];

/**
 * Enum for translation file names
 * These are the JSON files that contain translations each category
 */
export enum ETranslationFiles {
  TRANSLATIONS = "translations",
  ACCESSIBILITY = "accessibility",
  EDITOR = "editor",
  EMPTY_STATE = "empty-state",
  ADMIN = "admin",
}

export const LANGUAGE_STORAGE_KEY = "userLanguage";
