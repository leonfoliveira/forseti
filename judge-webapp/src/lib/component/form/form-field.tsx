/* eslint-disable formatjs/enforce-default-message */

import { SelectProps } from "@heroui/react";
import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import { useIntl } from "@/lib/util/intl-hook";

type HeroUIFormProps = {
  isInvalid?: boolean;
  errorMessage?: string | React.ReactNode;
  onChange?: (...args: any[]) => void;
  value?: any;
  name?: string;
};

type Props<
  TFieldValues extends FieldValues,
  TComponentProps extends HeroUIFormProps = HeroUIFormProps,
> = {
  children: React.ReactElement<TComponentProps>;
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  isFile?: boolean;
  isSelect?: boolean;
};

export function FormField<TFieldValues extends FieldValues>({
  children,
  form,
  name,
  isFile,
  isSelect,
}: Props<TFieldValues>) {
  const intl = useIntl();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;
        const errorMessage = error ? intl.formatMessage({ id: error }) : "";

        const fieldProps: Partial<HeroUIFormProps> = {
          ...field,
          isInvalid: !!error,
          errorMessage,
        };

        if (isFile) {
          delete fieldProps.value;
          fieldProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange(e.target.files);
          };
        }

        if (isSelect) {
          (fieldProps as Partial<SelectProps>).selectedKeys = [field.value];
        }

        return React.cloneElement(children, {
          ...fieldProps,
          ...children.props,
        });
      }}
    />
  );
}
