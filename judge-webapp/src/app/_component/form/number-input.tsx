import React from "react";
import { cls } from "@/app/_util/cls";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "form"
> & {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: string;
  "data-testid"?: string;
};

/**
 * NumberInput component for rendering a number input field
 */
export function NumberInput<TFieldValues extends FieldValues>({
  form,
  name,
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
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <fieldset
          className={cls("fieldset", containerClassName)}
          data-testid={`${testId}:container`}
        >
          <label
            className="fieldset-legend"
            htmlFor={name}
            data-testid={`${testId}:label`}
          >
            {label}
          </label>
          <input
            {...props}
            id={name}
            type="number"
            value={format(field.value)}
            onChange={(e) => field.onChange(parse(e.target.value))}
            className={cls("input w-full", className)}
            data-testid={testId}
          />
          <p
            className="label text-error text-wrap"
            data-testid={`${testId}:error`}
          >
            {!!fieldState.error?.message ? (
              <FormattedMessage id={fieldState.error.message} />
            ) : (
              ""
            )}
          </p>
        </fieldset>
      )}
    />
  );
}
