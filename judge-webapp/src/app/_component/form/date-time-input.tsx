import React from "react";
import { cls } from "@/app/_util/cls";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { DateUtils } from "@/app/_util/date-utils";
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
 * DateTimeInput component for rendering a datetime input field
 */
export function DateTimeInput<TFieldValues extends FieldValues>({
  form,
  label,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "date-input";

  function formToComponent(value?: Date) {
    return value ? DateUtils.toDateInputFormat(value) : "";
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
          data-testid={`${testId}:container`}
        >
          <label
            className="fieldset-legend"
            htmlFor={props.name}
            data-testid={`${testId}:label`}
          >
            {label}
          </label>
          <input
            {...props}
            id={props.name}
            type="datetime-local"
            value={formToComponent(field.value)}
            onChange={(e) => field.onChange(componentToForm(e.target.value))}
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
