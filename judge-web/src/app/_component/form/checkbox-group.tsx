import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "@/app/_component/form/checkbox";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
};

export function CheckboxGroup<TFieldValues extends FieldValues>({
  fm,
  label,
  options,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  function format(fieldValue: string[] | undefined, itemValue: string) {
    return (fieldValue || []).includes(itemValue);
  }

  function parse(
    fieldValue: string[] | undefined,
    itemValue: string,
    checked: boolean,
  ) {
    if (checked) {
      return [...(fieldValue || []), itemValue];
    }
    return (fieldValue || []).filter((it) => it !== itemValue);
  }

  return (
    <Controller
      control={fm.control}
      name={props.name}
      render={({ field, fieldState }) => (
        <div className={containerClassName}>
          <label className="block text-sm font-semibold">{label}</label>
          {options.map((item) => (
            <Checkbox
              {...props}
              className={className}
              key={item.value}
              checked={format(field.value, item.value)}
              onChange={(event) => {
                field.onChange(
                  parse(field.value, item.value, event.target.checked),
                );
              }}
            >
              {label}
            </Checkbox>
          ))}
          <p className="text-sm font-semibold text-red-500 min-h-[1em]">
            {fieldState.error?.message}
          </p>
        </div>
      )}
    />
  );
}
