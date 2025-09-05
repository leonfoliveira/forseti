import { Input, InputProps } from "@heroui/react";

import { env } from "@/config/env";
import { Label } from "@/lib/component/form/label";

export function FileInput({ label, ...props }: InputProps) {
  return (
    <Input
      variant={env.DEFAULT_INPUT_VARIANT}
      radius={env.DEFAULT_RADIUS}
      label={label && <Label size={props.size}>{label}</Label>}
      labelPlacement="outside-top"
      isClearable
      classNames={{
        inputWrapper: "border-dashed cursor-pointer",
      }}
      {...props}
      type="file"
    />
  );
}
