/* eslint-disable formatjs/enforce-default-message */

import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import { SelectProps, SwitchProps } from "@/lib/heroui-wrapper";
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
> = TComponentProps & {
  children: React.ReactElement<TComponentProps>;
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  isFile?: boolean;
  isSelect?: boolean;
  isSwitch?: boolean;
};

export function FormField<TFieldValues extends FieldValues>({
  children,
  form,
  name,
  isFile,
  isSelect,
  isSwitch,
  onChange,
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
          onChange: (e: any) => {
            onChange?.(e);
            field.onChange(e);
          },
          isInvalid: !!error,
          errorMessage,
        };

        if (isFile) {
          delete fieldProps.value;
          fieldProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            field.onChange(e.target.files);
          };
        }

        if (isSelect) {
          (fieldProps as Partial<SelectProps>).selectedKeys = [field.value];
        }

        if (isSwitch) {
          (fieldProps as Partial<SwitchProps>).isSelected = field.value;
          delete fieldProps.isInvalid;
          delete fieldProps.errorMessage;
        }

        return React.cloneElement(children, {
          ...fieldProps,
          ...children.props,
        });
      }}
    />
  );
}
