import * as HeroUI from "@heroui/react";
import React from "react";

import { Label } from "@/app/_lib/component/base/form/label";

export type SwitchProps = React.ComponentProps<typeof HeroUI.Switch> & {
  label?: React.ReactNode;
};

/**
 * Display a switch input component.
 */
export function Switch({ label, ...props }: SwitchProps) {
  return (
    <HeroUI.Switch {...props}>
      {label && <Label size={props.size || "md"}>{label}</Label>}
    </HeroUI.Switch>
  );
}
