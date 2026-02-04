import * as HeroUI from "@heroui/react";
import React from "react";

export type TooltipProps = React.ComponentProps<typeof HeroUI.Tooltip>;

/**
 * Display a tooltip component.
 */
export function Tooltip(props: TooltipProps) {
  return <HeroUI.Tooltip {...props} />;
}
