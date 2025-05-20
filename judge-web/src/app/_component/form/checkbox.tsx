import React from "react";

export function Checkbox({
  children,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input type="checkbox" {...props} />
      <label>{children}</label>
    </div>
  );
}
