import React from "react";
import { cls } from "@/app/_util/cls";

export function Checkbox({
  children,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <fieldset>
      <label className="label">
        <input
          type="checkbox"
          {...props}
          className={cls("toggle", className)}
        />
        {children}
      </label>
    </fieldset>
  );
}
