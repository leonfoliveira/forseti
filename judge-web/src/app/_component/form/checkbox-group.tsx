import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { Checkbox } from "@/app/_component/form/checkbox";
import { cls } from "@/app/_util/cls";
import { useTranslations } from "next-intl";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  s: ReturnType<typeof useTranslations>;
  containerClassName?: string;
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  "data-testid"?: string;
};

export function CheckboxGroup<TFieldValues extends FieldValues>({
  fm,
  s,
  label,
  options,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || `${props.name}-checkbox-group`;

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
        <fieldset
          className={cls(containerClassName, "fieldset")}
          data-testid={testId}
        >
          <label className="fieldset-legend" data-testid={`${testId}:label`}>
            {label}
          </label>
          <div className="grid gap-4 grid-cols-[repeat(auto-fill,_minmax(150px,_1fr))]">
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
                data-testid={`${testId}:checkbox`}
              >
                {item.label}
              </Checkbox>
            ))}
          </div>
          <p
            className="label text-error text-wrap"
            data-testid={`${testId}:error`}
          >
            {!!fieldState.error?.message ? s(fieldState.error.message) : ""}
          </p>
        </fieldset>
      )}
    />
  );
}
