import React, { DetailedHTMLProps, OptionHTMLAttributes } from "react";

export function SelectOption({
  children,
  ...props
}: DetailedHTMLProps<
  OptionHTMLAttributes<HTMLOptionElement>,
  HTMLOptionElement
>) {
  return <option {...props}>{children}</option>;
}
