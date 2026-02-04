import * as HeroUI from "@heroui/react";
import React from "react";

export type ChipProps = React.ComponentProps<typeof HeroUI.Chip>;

/**
 * Display a chip component.
 */
export function Chip(props: ChipProps) {
  return <HeroUI.Chip {...props} />;
}
