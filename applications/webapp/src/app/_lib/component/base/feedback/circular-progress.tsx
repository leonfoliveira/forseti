import * as HeroUI from "@heroui/react";
import React from "react";

export type CircularProgressProps = React.ComponentProps<
  typeof HeroUI.CircularProgress
>;

/**
 * Display a circular progress indicator.
 */
export function CircularProgress(props: CircularProgressProps) {
  return <HeroUI.CircularProgress {...props} />;
}
