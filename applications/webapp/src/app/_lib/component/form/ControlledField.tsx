import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import clsx from "clsx";

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
import type { ParseKeys, TOptions } from "i18next";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

type Props<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: ParseKeys;
  labelValues?: TOptions;
  field: React.ReactElement & { props: object };
  description?: string;
} & React.ComponentProps<typeof Field>;

export function ControlledField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  labelValues,
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
              className={clsx("mb-2", props.className)}
              orientation="horizontal"
            >
              {newField}
              <FieldContent className="gap-0">
                {label && (
                  <FieldLabel htmlFor={name}>
                    <FormattedMessage id={label} values={labelValues} />
                  </FieldLabel>
                )}
                {description && (
                  <FieldDescription>{description}</FieldDescription>
                )}
                {error && (
                  <FieldError>
                    <FormattedMessage id={error as ParseKeys} />
                  </FieldError>
                )}
              </FieldContent>
            </Field>
          );
        }

        return (
          <Field {...props} className={clsx("gap-1", props.className)}>
            {label && (
              <FieldLabel htmlFor={name}>
                <FormattedMessage id={label} values={labelValues} />
              </FieldLabel>
            )}
            {newField}
            <FieldContent>
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              {error && (
                <FieldError>
                  <FormattedMessage id={error as ParseKeys} />
                </FieldError>
              )}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}
