/* eslint-disable formatjs/enforce-default-message */

import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Checkbox } from "@/app/_lib/component/shadcn/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { Switch } from "@/app/_lib/component/shadcn/switch";
import { Message } from "@/i18n/message";

type Props<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: Message;
  field: React.ReactElement & { props: object };
  description?: Message;
} & React.ComponentProps<typeof Field>;

export function ControlledField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  field,
  description,
  ...props
}: Props<TFieldValues>) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field: fieldProps, fieldState }) => {
        const error = fieldState.error?.message;

        const newProps = {
          ...fieldProps,
          id: name,
          onChange: (e: any) => {
            fieldProps.onChange(e);
          },
        };

        const isFileInput =
          field.type === Input && (field.props as any).type === "file";
        const isCheckbox = field.type === Checkbox || field.type === Switch;

        if (isFileInput) {
          delete (newProps as any).value;
          newProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            fieldProps.onChange(e.target.files);
          };
        }

        if (isCheckbox) {
          (newProps as any).checked = fieldProps.value;
          (newProps as any).onCheckedChange = (checked: boolean) => {
            fieldProps.onChange(checked);
          };
        }

        const newField = React.cloneElement(field, newProps);

        if (isCheckbox) {
          return (
            <Field
              {...props}
              {...(isCheckbox ? { orientation: "horizontal" } : {})}
            >
              {newField}
              <FieldContent>
                {label && (
                  <FieldLabel htmlFor={name}>
                    {<FormattedMessage {...label} />}
                  </FieldLabel>
                )}
                {description && (
                  <FieldDescription>
                    <FormattedMessage {...description} />
                  </FieldDescription>
                )}
                {error && (
                  <FieldError>
                    <FormattedMessage id={error} defaultMessage="" />
                  </FieldError>
                )}
              </FieldContent>
            </Field>
          );
        }

        return (
          <Field
            {...props}
            {...(isCheckbox ? { orientation: "horizontal" } : {})}
          >
            {label && (
              <FieldLabel htmlFor={name}>
                <FormattedMessage {...label} />
              </FieldLabel>
            )}
            {newField}
            <FieldContent>
              {description && (
                <FieldDescription>
                  <FormattedMessage {...description} />
                </FieldDescription>
              )}
              {error && (
                <FieldError>
                  <FormattedMessage id={error} defaultMessage="" />
                </FieldError>
              )}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}
