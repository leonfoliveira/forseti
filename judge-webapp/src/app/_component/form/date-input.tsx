import React from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toDateInputFormat } from "@/app/_util/date-utils";

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

export function DateInput<TFieldValues extends FieldValues>({
  fm,
  s,
  label,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "date-input";

  function format(value?: Date) {
    return value ? toDateInputFormat(value) : "";
  }

  function parse(value?: string) {
    return value ? new Date(value) : undefined;
  }

  return (
    <Controller
      control={fm.control}
      name={props.name}
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
            type="datetime-local"
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls("input w-full", className)}
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
