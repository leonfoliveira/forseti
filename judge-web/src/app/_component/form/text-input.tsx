import React from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { useTranslations } from "next-intl";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  s: ReturnType<typeof useTranslations>;
  containerClassName?: string;
  label: string;
  password?: boolean;
  "data-testid"?: string;
};

export function TextInput<TFieldValues extends FieldValues>({
  fm,
  name,
  s,
  label,
  containerClassName,
  className,
  password = false,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "text-input";

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
        <fieldset
          className={cls("fieldset", containerClassName)}
          data-testid={testId}
        >
          <label className="fieldset-legend" data-testid={`${testId}:label`}>
            {label}
          </label>
          <input
            {...props}
            type={password ? "password" : "text"}
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls("input w-full", className)}
            data-testid={`${testId}:input`}
          />
          <p className="label text-error" data-testid={`${testId}:error`}>
            {!!fieldState.error?.message ? s(fieldState.error.message) : ""}
          </p>
        </fieldset>
      )}
    />
  );
}
