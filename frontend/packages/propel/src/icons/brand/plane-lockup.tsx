/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import * as React from "react";

import type { ISvgIcons } from "../type";

export function QlcvLockup({ height = "53", className }: ISvgIcons) {
  const h = typeof height === "number" ? height : parseInt(height, 10) || 53;

  return (
    <div className={className} style={{ display: "inline-flex", alignItems: "center", gap: `${Math.round(h * 0.15)}px` }}>
      <img src="/logo-icon.png" alt="QLCV" style={{ height: `${h}px`, width: `${h}px`, objectFit: "contain" }} />
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          lineHeight: 1.2,
          fontFamily: '"Helvetica Black", Arial, sans-serif',
        }}
      >
        <span style={{ fontWeight: 900, letterSpacing: "0.05em" }}>
          <span style={{ color: "#164397" }}>EVN</span>
          <span style={{ color: "#ed3237", fontStyle: "italic" }}>GENCO1</span>
        </span>
        <span style={{ fontSize: "0.65em", fontWeight: 900, letterSpacing: "0.06em" }}>
          <span style={{ color: "#164397" }}>QUẢN LÝ CÔNG VIỆC </span>
          <span style={{ color: "#ed3237" }}>(QLCV)</span>
        </span>
      </span>
    </div>
  );
}
