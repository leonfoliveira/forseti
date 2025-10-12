import { Input, InputProps } from "@/lib/heroui-wrapper";

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
