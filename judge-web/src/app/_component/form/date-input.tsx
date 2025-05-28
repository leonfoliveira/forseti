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
        <fieldset className={cls("fieldset", containerClassName)}>
          <label className="fieldset-legend">{label}</label>
          <input
            {...props}
            type="datetime-local"
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls("input w-full", className)}
          />
          <p className="label text-error">{fieldState.error?.message}</p>
        </fieldset>
      )}
    />
  );
}
