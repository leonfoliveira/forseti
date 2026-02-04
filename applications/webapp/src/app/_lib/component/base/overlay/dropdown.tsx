import * as HeroUI from "@heroui/react";
import React from "react";

export type DropdownProps = React.ComponentProps<typeof HeroUI.Dropdown>;

/**
 * Display a dropdown component.
 */
export function Dropdown(props: DropdownProps) {
  return <HeroUI.Dropdown {...props} />;
}

export type DropdownTriggerProps = React.ComponentProps<
  typeof HeroUI.DropdownTrigger
>;

/**
 * Display dropdown trigger.
 */
Dropdown.Trigger = function DropdownTrigger(props: DropdownTriggerProps) {
  return <HeroUI.DropdownTrigger {...props} />;
};

export type DropdownMenuProps = React.ComponentProps<
  typeof HeroUI.DropdownMenu
>;

/**
 * Display dropdown menu.
 */
Dropdown.Menu = function DropdownMenu(props: DropdownMenuProps) {
  return <HeroUI.DropdownMenu {...props} />;
};

export type DropdownItemProps = React.ComponentProps<
  typeof HeroUI.DropdownItem
>;

/**
 * Display dropdown item.
 */
function DropdownItem(props: DropdownItemProps) {
  return <HeroUI.DropdownItem {...props} />;
}

// Preserve the getCollectionNode method from HeroUI.DropdownItem for React Stately
Object.defineProperty(DropdownItem, "getCollectionNode", {
  value: (HeroUI.DropdownItem as any).getCollectionNode,
  writable: true,
});

Dropdown.Item = DropdownItem;
