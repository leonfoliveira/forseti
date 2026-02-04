import * as HeroUI from "@heroui/react";

import { Label } from "@/app/_lib/component/base/form/label";

export type DatePickerProps = React.ComponentProps<typeof HeroUI.DatePicker>;

/**
 * Display a date picker input component.
 */
export function DatePicker(props: DatePickerProps) {
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
