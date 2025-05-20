import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, ...props }: Props) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} />
      {error && <p>{error}</p>}
    </div>
  );
}
