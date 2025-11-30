export * from "@heroui/react";
import * as HeroUI from "@heroui/react";
import React from "react";

import { Label } from "@/app/_lib/component/form/label";

/**
 * Wrapper components for HeroUI with default props set.
 */

/**
 * Display a checkbox input component.
 */
export function Checkbox({
  label,
  ...props
}: HeroUI.CheckboxProps & { label?: React.ReactNode }) {
  return (
    <HeroUI.Checkbox {...props}>
      {label && <Label size={props.size || "md"}>{label}</Label>}
    </HeroUI.Checkbox>
  );
}

/**
 * Display a grouper for checkbox inputs that share the same name.
 * Its value is an array of selected checkbox values.
 */
export function CheckboxGroup(props: HeroUI.CheckboxGroupProps) {
  return (
    <HeroUI.CheckboxGroup
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
      description={
        props.description && (
          <span className="text-xs text-muted-foreground">
            {props.description}
          </span>
        )
      }
    />
  );
}

/**
 * Display a date picker input component.
 */
export function DatePicker(props: HeroUI.DatePickerProps) {
  return (
    <HeroUI.DatePicker
      variant="bordered"
      labelPlacement="outside"
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
    />
  );
}

/**
 * Display an input text component.
 */
export function Input(props: HeroUI.InputProps) {
  return (
    <HeroUI.Input
      variant="bordered"
      labelPlacement="outside-top"
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
    />
  );
}

/**
 * Display a number input component.
 */
export function NumberInput(props: HeroUI.NumberInputProps) {
  return (
    <HeroUI.NumberInput
      variant="bordered"
      labelPlacement="outside"
      placeholder=" "
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
    />
  );
}

/**
 * Display a select input component.
 */
export function Select(props: HeroUI.SelectProps) {
  return (
    <HeroUI.Select
      variant="bordered"
      labelPlacement="outside"
      placeholder=" "
      {...props}
      label={
        props.label && <Label size={props.size || "md"}>{props.label}</Label>
      }
    />
  );
}

/**
 * Display a switch input component.
 */
export function Switch({
  label,
  ...props
}: HeroUI.SwitchProps & { label?: React.ReactNode }) {
  return (
    <HeroUI.Switch {...props}>
      {label && <Label size={props.size || "md"}>{label}</Label>}
    </HeroUI.Switch>
  );
}
