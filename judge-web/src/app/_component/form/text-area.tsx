import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import React from "react";
import { cls } from "@/app/_util/cls";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLTextAreaElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function TextArea<TFieldValues extends FieldValues>({
  fm,
  name,
  className,
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
      render={({ field }) => (
        <textarea
          {...props}
          value={format(field.value)}
          onChange={(e) => field.onChange(parse(e.target.value))}
          className={cls(
            "block w-full p-2 bg-gray-100 rounded-lg placeholder:text-gray-400 disabled:text-gray-300",
            className,
          )}
        />
      )}
    />
  );
}
