import * as HeroUI from "@heroui/react";
import React from "react";

export type AlertProps = React.ComponentProps<typeof HeroUI.Alert>;

/**
 * Display an alert component.
 */
export function Alert(props: AlertProps) {
  return <HeroUI.Alert {...props} />;
}
