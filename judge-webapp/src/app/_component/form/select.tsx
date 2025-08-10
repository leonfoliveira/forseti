import React, { DetailedHTMLProps, SelectHTMLAttributes } from "react";
import { cls } from "@/app/_util/cls";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { Message } from "@/i18n/message";

type Props<TFieldValues extends FieldValues> = Omit<
  DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>,
  "form"
> & {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: Message;
  options: {
    value: string;
    label: Message;
  }[];
  "data-testid"?: string;
};

function formToComponent(value?: string) {
  return value || "";
}

function componentToForm(value: string) {
  return value;
}

/**
 * Select component for rendering a select input field with options
 */
export function Select<TFieldValues extends FieldValues>({
  form,
  label,
  name,
  containerClassName,
  className,
  options,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "select";

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <fieldset
          className={cls(containerClassName, "fieldset")}
          data-testid={`${testId}:container`}
        >
          <label
            className="fieldset-legend"
            htmlFor={name}
            data-testid={`${testId}:label`}
          >
            <FormattedMessage {...label} />
          </label>
          <select
            {...props}
            id={name}
            value={formToComponent(field.value)}
            onChange={(e) => {
              field.onChange(componentToForm(e.target.value));
            }}
            className={cls("select w-full", className)}
            data-testid={testId}
          >
            <option value="" />
            {options.map((it) => (
              <option
                key={it.value}
                value={it.value}
                data-testid={`${testId}:option`}
              >
                <FormattedMessage {...it.label} />
              </option>
            ))}
          </select>
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
