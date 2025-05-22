import React from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFile } from "@fortawesome/free-solid-svg-icons";

type Props<TFieldValues extends FieldValues> = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  fm: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: string;
  onClean?: () => void;
};

export function FileInput<TFieldValues extends FieldValues>({
  fm,
  name,
  label,
  onClean,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  function parse(value: FileList | null) {
    return value ? value[0] : undefined;
  }

  return (
    <Controller
      control={fm.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={containerClassName}>
          <label className="block text-sm font-semibold">{label}</label>
          <input
            {...props}
            id={name}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                field.onChange(parse(e.target.files));
              }
            }}
            className={cls("hidden", className)}
          />
          <div className="flex items-stretch">
            <label
              htmlFor={name}
              className={cls(
                "flex w-full bg-gray-100 rounded-l-lg placeholder:text-gray-400 cursor-pointer",
                props.disabled && "text-gray-300",
              )}
            >
              <div className="me-2 bg-gray-200 flex items-center px-2 rounded-l-lg">
                <FontAwesomeIcon icon={faFile} />
              </div>
              <p className="p-2">
                {field.value ? field.value.name : "Select..."}
              </p>
            </label>
            <div
              className="bg-gray-200 rounded-r-lg px-2 flex items-center cursor-pointer"
              onClick={() => onClean?.()}
            >
              <FontAwesomeIcon icon={faClose} />
            </div>
          </div>
          <p className="text-sm font-semibold text-red-500 min-h-[1em]">
            {fieldState.error?.message}
          </p>
        </div>
      )}
    />
  );
}
