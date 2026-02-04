import * as HeroUI from "@heroui/react";

import { Label } from "@/app/_lib/component/base/form/label";

export type InputProps = React.ComponentProps<typeof HeroUI.Input>;

/**
 * Display an input text component.
 */
export function Input(props: InputProps) {
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
