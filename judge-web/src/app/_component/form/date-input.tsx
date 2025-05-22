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
};

export function DateInput<TFieldValues extends FieldValues>({
  fm,
  label,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  function format(value?: Date) {
    return value ? value.toISOString().slice(0, 16) : "";
  }

  function parse(value?: string) {
    return value ? new Date(value) : undefined;
  }

  return (
    <Controller
      control={fm.control}
      name={props.name}
      render={({ field, fieldState }) => (
        <div className={containerClassName}>
          <label className="block text-sm font-semibold">{label}</label>
          <input
            {...props}
            type="datetime-local"
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls(
              "block w-full p-2 bg-gray-100 rounded-lg disabled:text-gray-400",
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
