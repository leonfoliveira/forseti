/* eslint-disable formatjs/enforce-default-message */

import React from "react";
import {
  Controller,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import { FileInput } from "@/app/_lib/component/base/form/file-input";
import { Select, SelectProps } from "@/app/_lib/component/base/form/select";
import { Switch, SwitchProps } from "@/app/_lib/component/base/form/switch";
import { useIntl } from "@/app/_lib/util/intl-hook";

export type FormProps = React.FormHTMLAttributes<HTMLFormElement>;

/**
 * A form component that wraps its children in a HTML form element.
 */
export function Form(props: FormProps) {
  return <form {...props} role="form" />;
}

type HeroUIFormProps = {
  isInvalid?: boolean;
  errorMessage?: string | React.ReactNode;
  onChange?: (...args: any[]) => void;
  value?: any;
  name?: string;
};

export type FormFieldProps<
  TFieldValues extends FieldValues,
  TComponentProps extends HeroUIFormProps = HeroUIFormProps,
> = TComponentProps & {
  children: React.ReactElement<TComponentProps>;
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

/**
 * Wrapper around HeroUI form fields to inject react-hook-form props
 */
Form.Field = function FormField<TFieldValues extends FieldValues>({
  children,
  form,
  name,
  onChange,
}: FormFieldProps<TFieldValues>) {
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

        const isFileInputComponent = children.type === FileInput;
        const isSelectComponent = children.type === Select;
        const isSwitchComponent = children.type === Switch;

        if (isFileInputComponent) {
          delete fieldProps.value;
          fieldProps.onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            field.onChange(e.target.files);
          };
        }

        if (isSelectComponent) {
          (fieldProps as SelectProps).selectedKeys = [field.value];
        }

        if (isSwitchComponent) {
          (fieldProps as SwitchProps).isSelected = field.value;
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
};
