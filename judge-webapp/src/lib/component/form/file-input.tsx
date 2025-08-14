/* eslint-disable formatjs/enforce-default-message */
import { faClose, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { DetailedHTMLProps, InputHTMLAttributes, useRef } from "react";
import {
  Controller,
  UseFormReturn,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { defineMessages, FormattedMessage } from "react-intl";

import { Attachment } from "@/core/domain/model/Attachment";
import { Message } from "@/i18n/message";
import { cls } from "@/lib/util/cls";

const messages = defineMessages({
  empty: {
    id: "app._component.form.file-input",
    defaultMessage: "Select a file",
  },
});

type Props<TFieldValues extends FieldValues> = Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  "form"
> & {
  form: UseFormReturn<TFieldValues>;
  originalName?: FieldPath<TFieldValues>;
  name: FieldPath<TFieldValues>;
  containerClassName?: string;
  label: Message;
  onDownloadOriginal?: (attachment: Attachment) => void;
  "data-testid"?: string;
};

function componentToForm(value: FileList | null) {
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

/**
 * FileInput component for rendering a file input field with a download and reset button.
 */
export function FileInput<TFieldValues extends FieldValues>({
  form,
  originalName,
  name,
  label,
  onDownloadOriginal,
  containerClassName,
  className,
  ...props
}: Props<TFieldValues>) {
  const testId = props["data-testid"] || "file-input";
  const ref = useRef<HTMLInputElement | null>(null);

  const originalValue: Attachment | undefined =
    originalName && form.watch(originalName);

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <fieldset
          className={cls(containerClassName, "fieldset")}
          data-testid={`${testId}:container`}
        >
          <label
            className="fieldset-legend"
            htmlFor={name}
            data-testid={`${testId}:label`}
          >
            <FormattedMessage {...label} />
          </label>
          <input
            {...props}
            ref={ref}
            id={name}
            type="file"
            onChange={(e) => {
              field.onChange(componentToForm(e.target.files));
            }}
            className={cls("hidden", className)}
            data-testid={testId}
          />
          <div className="join">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="input rounded-l cursor-pointer w-full"
              data-testid={`${testId}:button`}
            >
              {field.value && field.value.name}
              {!field.value && originalValue && originalValue.filename}
              {!field.value && !originalValue && (
                <span className="text-gray-400">
                  <FormattedMessage {...messages.empty} />
                </span>
              )}
            </button>
            <button
              type="button"
              className="btn btn-soft px-3"
              onClick={() => {
                if (field.value) onDownload(field.value);
                else if (originalValue) onDownloadOriginal?.(originalValue);
              }}
              data-testid={`${testId}:download`}
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button
              type="button"
              className="btn btn-soft px-3"
              onClick={() => field.onChange(undefined)}
              data-testid={`${testId}:reset`}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          </div>
          <p
            className="label text-error text-wrap"
            data-testid={`${testId}:error`}
          >
            {!!fieldState.error?.message ? (
              <FormattedMessage id={fieldState.error.message} />
            ) : (
              ""
            )}
          </p>
        </fieldset>
      )}
    />
  );
}
