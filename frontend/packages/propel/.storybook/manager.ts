/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

const qlcvTheme = create({
  base: "dark",
  brandTitle: "QLCV UI",
  brandUrl: "https://ems.evngenco1.vn/qlcv",
  brandImage: "qlcv-lockup-light.svg",
  brandTarget: "_self",
});

addons.setConfig({
  theme: qlcvTheme,
});
