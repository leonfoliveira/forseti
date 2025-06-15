import React from "react";
import { cls } from "@/app/_util/cls";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { toDateInputFormat } from "@/app/_util/date-utils";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "form"
> & {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  s: ReturnType<typeof useTranslations>;
  containerClassName?: string;
  label: string;
  "data-testid"?: string;
};

/**
 * DateTimeInput component for rendering a datetime input field
 */
export function DateTimeInput<TFieldValues extends FieldValues>({
  form,
  s,
  label,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "date-input";

  function formToComponent(value?: Date) {
    return value ? toDateInputFormat(value) : "";
  }

  function componentToForm(value?: string) {
    return value ? new Date(value) : undefined;
  }

  return (
    <Controller
      control={form.control}
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
            value={formToComponent(field.value)}
            onChange={(e) => field.onChange(componentToForm(e.target.value))}
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
