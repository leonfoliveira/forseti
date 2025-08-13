import React, { DetailedHTMLProps, FormHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
  "data-testid"?: string;
  containerClassName?: string;
};

/**
 * Form component for rendering a form with fieldset
 * Disabling the form will disable all its children
 */
export function Form({
  children,
  className,
  disabled = false,
  containerClassName,
  ...props
}: Props) {
  const testId = props["data-testid"] || "form";
  return (
    <fieldset
      disabled={disabled}
      className={containerClassName}
      data-testid={`${testId}:container`}
    >
      <form {...props} className={className} data-testid={testId}>
        {children}
      </form>
    </fieldset>
  );
}
