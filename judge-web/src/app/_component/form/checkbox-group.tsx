import React from "react";

type Props = {
  children: React.ReactNode;
  label?: string;
  error?: string;
};

export function CheckboxGroup({ children, ...props }: Props) {
  return (
    <div>
      {props.label && (
        <label className="block text-sm font-semibold">{props.label}</label>
      )}
      {children}
      <p className="text-sm font-semibold text-red-500 min-h-[1em]">
        {props.error}
      </p>
    </div>
  );
}
