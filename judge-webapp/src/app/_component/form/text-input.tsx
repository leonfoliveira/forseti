import React, { useEffect } from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { FormattedMessage } from "react-intl";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "form"
> & {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  value?: string;
  containerClassName?: string;
  label: string;
  password?: boolean;
  "data-testid"?: string;
};

/**
 * TextInput component for rendering a text input field
 */
export function TextInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  containerClassName,
  className,
  password = false,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "text-input";

  useEffect(() => {
    if (props.value) {
      form.setValue(name, props.value as any);
    }
  }, []);

  function formToComponent(value?: string) {
    return value || "";
  }

  function componentToForm(value: string) {
    return value;
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
            type={password ? "password" : "text"}
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
