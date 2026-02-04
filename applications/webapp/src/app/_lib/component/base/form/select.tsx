import * as HeroUI from "@heroui/react";

import { Label } from "@/app/_lib/component/base/form/label";

export type SelectProps = React.ComponentProps<typeof HeroUI.Select>;

/**
 * Display a select input component.
 */
export function Select(props: SelectProps) {
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

export type SelectItemProps = React.ComponentProps<typeof HeroUI.SelectItem>;

/**
 * Display a select item component.
 */
function SelectItem(props: SelectItemProps) {
  return <HeroUI.SelectItem {...props} />;
}

// Preserve the getCollectionNode method from HeroUI.SelectItem for React Stately
Object.defineProperty(SelectItem, "getCollectionNode", {
  value: (HeroUI.SelectItem as any).getCollectionNode,
  writable: true,
});

Select.Item = SelectItem;
