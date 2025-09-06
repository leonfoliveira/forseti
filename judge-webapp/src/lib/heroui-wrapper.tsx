export * from "@heroui/react";
import * as HeroUI from "@heroui/react";

import { Label } from "@/lib/component/form/label";

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
