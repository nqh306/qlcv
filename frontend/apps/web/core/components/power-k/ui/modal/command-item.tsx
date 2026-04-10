/**
 * Copyright (c) 2023-present EVNGENCO1 and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { Command } from "cmdk";

import { CheckIcon } from "@qlcv/propel/icons";
// qlcv imports
import { cn } from "@qlcv/utils";
// local imports
import { KeySequenceBadge, ShortcutBadge } from "./command-item-shortcut-badge";

type Props = {
  icon?: React.ComponentType<{ className?: string }>;
  iconNode?: React.ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  keySequence?: string;
  label: string | React.ReactNode;
  onSelect: () => void;
  shortcut?: string;
  value?: string;
};

export function PowerKModalCommandItem(props: Props) {
  const { icon: Icon, iconNode, isDisabled, isSelected, keySequence, label, onSelect, shortcut, value } = props;

  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-md bg-layer-transparent p-2 text-body-xs-regular focus:outline-none aria-selected:bg-layer-transparent-active aria-disabled:cursor-not-allowed aria-disabled:bg-layer-transparent aria-disabled:opacity-50"
      disabled={isDisabled}
    >
      <div
        className={cn("flex min-w-0 flex-1 items-center gap-2 text-secondary", {
          "opacity-70": isDisabled,
        })}
      >
        {Icon && <Icon className="size-3.5 shrink-0" />}
        {iconNode}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isSelected && <CheckIcon className="size-3 shrink-0 text-secondary" />}
        {keySequence && <KeySequenceBadge sequence={keySequence} />}
        {shortcut && <ShortcutBadge shortcut={shortcut} />}
      </div>
    </Command.Item>
  );
}
