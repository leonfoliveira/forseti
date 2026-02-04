import * as HeroUI from "@heroui/react";

import { Label } from "@/app/_lib/component/base/form/label";

export type NumberInputProps = React.ComponentProps<typeof HeroUI.NumberInput>;

/**
 * Display a number input component.
 */
export function NumberInput(props: NumberInputProps) {
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
