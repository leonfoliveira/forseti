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
import { useIntl } from "@/app/_lib/util/intl-hook";
import { Message } from "@/i18n/message";

type Props<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: Message;
  field: React.ReactElement & { props: object };
  onChange?: (...args: any[]) => void;
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

        const newField = React.cloneElement(field, {
          ...fieldProps,
          ...field.props,
          ...{
            id: name,
            onChange: (...args: any[]) => {
              fieldProps.onChange(...args);
              onChange?.(...args);
            },
          },
        });

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
