import * as HeroUI from "@heroui/react";
import React from "react";

export type TabsProps = React.ComponentProps<typeof HeroUI.Tabs>;

/**
 * Display a tabs container component.
 */
export function Tabs(props: TabsProps) {
  return <HeroUI.Tabs {...props} />;
}

export type TabsItemProps = React.ComponentProps<typeof HeroUI.Tab>;

/**
 * Display an individual tab component.
 */
function TabsItem(props: TabsItemProps) {
  return <HeroUI.Tab {...props} />;
}

// Preserve the getCollectionNode method from HeroUI.Tab for React Stately
Object.defineProperty(TabsItem, "getCollectionNode", {
  value: (HeroUI.Tab as any).getCollectionNode,
  writable: true,
});

Tabs.Item = TabsItem;
