import React, { DetailedHTMLProps, FormHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
  "data-testid"?: string;
};

export function Form({
  children,
  className,
  disabled = false,
  ...props
}: Props) {
  const testId = props["data-testid"] || "form";
  return (
    <fieldset disabled={disabled} className={className} data-testid={testId}>
      <form {...props} data-testid={`${testId}:form`}>
        {children}
      </form>
    </fieldset>
  );
}
