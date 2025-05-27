import React, { DetailedHTMLProps, FormHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  children: React.ReactNode;
  disabled?: boolean;
};

export function Form({ children, disabled = false, ...props }: Props) {
  return (
    <fieldset disabled={disabled}>
      <form {...props}>{children}</form>
    </fieldset>
  );
}
