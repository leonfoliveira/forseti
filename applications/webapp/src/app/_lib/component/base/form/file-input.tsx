import React from "react";

import { Input } from "@/app/_lib/component/base/form/input";

export type FileInputProps = React.ComponentProps<typeof Input>;

/**
 * A file input component that allows users to select files for upload.
 */
export function FileInput({ label, ...props }: FileInputProps) {
  return (
    <Input
      label={label}
      isClearable
      classNames={{
        inputWrapper: "border-dashed cursor-pointer",
      }}
      {...props}
      type="file"
    />
  );
}
