import React, { DetailedHTMLProps, SelectHTMLAttributes } from "react";
import { cls } from "@/app/_util/cls";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

type Props<TFieldValues extends FieldValues> = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label?: string;
  options: {
    value: string;
    label: string;
  }[];
};

export function Select<TFieldValues extends FieldValues>({
  fm,
  label,
  name,
  containerClassName,
  className,
  options,
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
        <fieldset className={cls(containerClassName, "fieldset")}>
          <label className="fieldset-legend">{label}</label>
          <select
            {...props}
            value={format(field.value)}
            onChange={(e) => {
              field.onChange(parse(e.target.value));
            }}
            className={cls("select w-full", className)}
          >
            <option value="" />
            {options.map((it) => (
              <option key={it.value} value={it.value}>
                {it.label}
              </option>
            ))}
          </select>
          <p className="label text-error">{fieldState.error?.message}</p>
        </fieldset>
      )}
    />
  );
}
