import React from "react";

type Props = {
  children: React.ReactNode;
  label?: string;
  error?: string;
};

export function CheckboxGroup({ children, ...props }: Props) {
  return (
    <div>
      {props.label && <label>{props.label}</label>}
      {children}
      {props.error && <p>{props.error}</p>}
    </div>
  );
}
