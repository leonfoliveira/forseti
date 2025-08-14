/* eslint-disable formatjs/enforce-default-message */
import React from "react";
import {
  Controller,
  UseFormReturn,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";

import { Message } from "@/i18n/message";
import { Checkbox } from "@/lib/component/form/checkbox";
import { cls } from "@/lib/util/cls";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "form"
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

function formToComponent(fieldValue: string[] | undefined, itemValue: string) {
  return (fieldValue || []).includes(itemValue);
}

function componentToForm(
  fieldValue: string[] | undefined,
  itemValue: string,
  checked: boolean,
) {
  if (checked) {
    return [...(fieldValue || []), itemValue];
  }
  return (fieldValue || []).filter((it) => it !== itemValue);
}

/**
 * CheckboxGroup component for rendering a group of checkboxes
 */
export function CheckboxGroup<TFieldValues extends FieldValues>({
  form,
  label,
  options,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "checkbox-group";

  return (
    <Controller
      control={form.control}
      name={props.name}
      render={({ field, fieldState }) => (
        <fieldset
          className={cls(containerClassName, "fieldset")}
          data-testid={testId}
        >
          <label className="fieldset-legend" data-testid={`${testId}:label`}>
            <FormattedMessage {...label} />
          </label>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))]">
            {options.map((item) => (
              <Checkbox
                {...props}
                label={item.label}
                className={className}
                key={item.value}
                checked={formToComponent(field.value, item.value)}
                onChange={(event) => {
                  field.onChange(
                    componentToForm(
                      field.value,
                      item.value,
                      event.target.checked,
                    ),
                  );
                }}
                data-testid={`${testId}:checkbox`}
              />
            ))}
          </div>
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
