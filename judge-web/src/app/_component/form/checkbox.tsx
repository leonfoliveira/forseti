import React from "react";

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input type="checkbox" {...props} />
      <label>{props.children}</label>
    </div>
  );
}
