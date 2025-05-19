import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input(props: Props) {
  return (
    <div>
      {props.label && <label>{props.label}</label>}
      <input {...props} />
      {props.error && <p>{props.error}</p>}
    </div>
  );
}
