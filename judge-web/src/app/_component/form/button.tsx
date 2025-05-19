import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function Button({ type, ...props }: Props) {
  return (
    <button type={type || "button"} {...props}>
      {props.children}
    </button>
  );
}
