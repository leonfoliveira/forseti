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
  "data-testid"?: string;
};

export function NumberInput<TFieldValues extends FieldValues>({
  fm,
  name,
  s,
  label,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "number-input";

  function format(value?: number) {
    return value ? value.toString() : "";
  }

  function parse(value: string) {
    return parseInt(value);
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
            type="number"
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls("input", className)}
            data-testid={`${testId}:input`}
          />
          <p
            className="label text-error text-wrap"
            data-testid={`${testId}:error`}
          >
            {!!fieldState.error?.message ? s(fieldState.error.message) : ""}
          </p>
        </fieldset>
      )}
    />
  );
}
