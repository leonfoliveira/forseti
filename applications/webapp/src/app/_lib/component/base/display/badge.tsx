import * as HeroUI from "@heroui/react";
import React from "react";

export type BadgeProps = React.ComponentProps<typeof HeroUI.Badge>;

/**
 * Display a badge component.
 */
export function Badge(props: BadgeProps) {
  return <HeroUI.Badge {...props} />;
}
