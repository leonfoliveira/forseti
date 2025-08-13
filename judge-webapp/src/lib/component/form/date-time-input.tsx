import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";

import { Message } from "@/i18n/message";
import { cls } from "@/lib/util/cls";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "form"
> & {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: Message;
  "data-testid"?: string;
};

function toInputFormat(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formToComponent(value?: Date) {
  return value ? toInputFormat(value) : "";
}

function componentToForm(value?: string) {
  return value ? new Date(value) : undefined;
}

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
            <FormattedMessage {...label} />
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
