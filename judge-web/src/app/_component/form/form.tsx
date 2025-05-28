import React, { DetailedHTMLProps, FormHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
};

export function Form({
  children,
  className,
  disabled = false,
  ...props
}: Props) {
  return (
    <fieldset disabled={disabled} className={className}>
      <form {...props}>{children}</form>
    </fieldset>
  );
}
