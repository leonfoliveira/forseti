import * as HeroUI from "@heroui/react";
import React from "react";

export type ButtonProps = React.ComponentProps<typeof HeroUI.Button>;

/**
 * Display a button component.
 */
export function Button(props: ButtonProps) {
  return <HeroUI.Button {...props} />;
}
