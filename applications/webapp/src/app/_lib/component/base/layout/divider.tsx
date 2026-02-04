import * as HeroUI from "@heroui/react";
import React from "react";

export type DividerProps = React.ComponentProps<typeof HeroUI.Divider>;

/**
 * Display a divider component.
 */
export function Divider(props: DividerProps) {
  return <HeroUI.Divider {...props} />;
}
