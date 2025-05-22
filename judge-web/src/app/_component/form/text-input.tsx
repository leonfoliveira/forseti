import React from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: string;
  password?: boolean;
};

export function TextInput<TFieldValues extends FieldValues>({
  fm,
  name,
  label,
  containerClassName,
  className,
  password = false,
  ...props
}: Props<TFieldValues>) {
  function format(value?: string) {
    return value || "";
  }

  function parse(value: string) {
    return value;
  }

  return (
    <Controller
      control={fm.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={containerClassName}>
          <label className="block text-sm font-semibold">{label}</label>
          <input
            {...props}
            type={password ? "password" : "text"}
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls(
              "block w-full p-2 bg-gray-100 rounded-lg placeholder:text-gray-400 disabled:text-gray-300",
              className,
            )}
          />
          <p className="text-sm font-semibold text-red-500 min-h-[1em]">
            {fieldState.error?.message}
          </p>
        </div>
      )}
    />
  );
}
