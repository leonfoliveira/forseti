import * as HeroUI from "@heroui/react";
import React from "react";

import { Label } from "@/app/_lib/component/base/form/label";

type CheckboxProps = React.ComponentProps<typeof HeroUI.Checkbox> & {
  label?: React.ReactNode;
};

/**
 * Display a checkbox component.
 */
export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <HeroUI.Checkbox {...props}>
      {label && <Label size={props.size || "md"}>{label}</Label>}
    </HeroUI.Checkbox>
  );
}

export type CheckboxGroupProps = HeroUI.CheckboxGroupProps;

/**
 * Display a group of checkboxes that connects them to a single field with an array of values.
 */
Checkbox.Group = function CheckboxGroup(props: CheckboxGroupProps) {
  return (
    <HeroUI.CheckboxGroup
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
      description={
        props.description && (
          <span className="text-muted-foreground text-xs">
            {props.description}
          </span>
        )
      }
    />
  );
};
