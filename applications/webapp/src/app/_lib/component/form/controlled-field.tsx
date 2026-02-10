/* eslint-disable formatjs/enforce-default-message */

import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/app/_lib/component/shadcn/field";
import { Input } from "@/app/_lib/component/shadcn/input";
import { useIntl } from "@/app/_lib/util/intl-hook";
import { Message } from "@/i18n/message";

type Props<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: Message;
  field: React.ReactElement & { props: object };
  onChange?: (e: React.ChangeEvent) => void;
};

export function ControlledField<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  field,
  onChange,
}: Props<TFieldValues>) {
  const intl = useIntl();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field: fieldProps, fieldState }) => {
        const error = fieldState.error?.message;
        const errorMessage = error ? intl.formatMessage({ id: error }) : "";

        const props = {
          ...fieldProps,
          id: name,
          onChange: (e: any) => {
            onChange?.(e);
            fieldProps.onChange(e);
          },
        };

        const isFileInput =
          field.type === Input && (field.props as any).type === "file";

        if (isFileInput) {
          delete (props as any).value;
          props.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            fieldProps.onChange(e.target.files);
          };
        }

        const newField = React.cloneElement(field, props);

        return (
          <Field>
            <FieldLabel htmlFor={name}>
              <FormattedMessage {...label} />
            </FieldLabel>
            {newField}
            {errorMessage && (
              <FieldDescription className="text-destructive">
                {errorMessage}
              </FieldDescription>
            )}
          </Field>
        );
      }}
    />
  );
}
