import { Input, InputProps } from "@/app/_lib/heroui-wrapper";

/**
 * A file input component that allows users to select files for upload.
 */
export function FileInput({ label, ...props }: InputProps) {
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
