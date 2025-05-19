import React, { DetailedHTMLProps, SelectHTMLAttributes } from "react";

type Props = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  label?: string;
  error?: string;
};

export function Select({ children, ...props }: Props) {
  return (
    <div>
      {props.label && <label>{props.label}</label>}
      <select {...props}>{children}</select>
      {props.error && <p>{props.error}</p>}
    </div>
  );
}
