import React, { DetailedHTMLProps, InputHTMLAttributes, useRef } from "react";
import { cls } from "@/app/_util/cls";
import { Controller, UseFormReturn } from "react-hook-form";
import { FieldPath, FieldValues } from "react-hook-form";
import { Attachment } from "@/core/domain/model/Attachment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faDownload } from "@fortawesome/free-solid-svg-icons";

type Props<TFieldValues extends FieldValues> = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  fm: UseFormReturn<TFieldValues>;
  originalName?: FieldPath<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: string;
  onDownloadOriginal?: (attachment: Attachment) => void;
};

export function FileInput<TFieldValues extends FieldValues>({
  fm,
  originalName,
  name,
  label,
  onDownloadOriginal,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const ref = useRef<HTMLInputElement | null>(null);

  function parse(value: FileList | null) {
    return value && value.length > 0 ? value[0] : undefined;
  }

  function onDownload(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.target = "_blank";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const originalValue: Attachment | undefined =
    originalName && fm.watch(originalName);

  return (
    <Controller
      control={fm.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={containerClassName}>
          <label className="block text-sm font-semibold">{label}</label>
          <input
            {...props}
            ref={ref}
            id={name}
            type="file"
            onChange={(e) => {
              field.onChange(parse(e.target.files));
            }}
            className={cls("hidden", className)}
          />
          <div className="flex">
            <button
              type="button"
              className="bg-gray-200 px-2 rounded-l-lg cursor-pointer"
              onClick={() => {
                if (field.value) onDownload(field.value);
                else if (originalValue) onDownloadOriginal?.(originalValue);
              }}
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="block w-full p-2 bg-gray-100 disabled:text-gray-300 cursor-pointer truncate"
            >
              {field.value && field.value.name}
              {!field.value && originalValue && originalValue.filename}
              {!field.value && !originalValue && (
                <span className="text-gray-400">Select a file</span>
              )}
            </button>
            <button
              type="button"
              className="bg-gray-200 rounded-r-lg px-2 cursor-pointer"
              onClick={() => field.onChange(undefined)}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>
          <p className="text-sm font-semibold text-red-500 min-h-[1em]">
            {fieldState.error?.message}
          </p>
        </div>
      )}
    />
  );
}
