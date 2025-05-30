import React from "react";
import { cls } from "@/app/_util/cls";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  "data-testid"?: string;
};

export function Checkbox({ children, className, ...props }: Props) {
  const testId = props["data-testid"] || "checkbox";

  return (
    <fieldset data-testid={testId}>
      <label className="label" data-testid={`${testId}:label`}>
        <input
          type="checkbox"
          {...props}
          className={cls("toggle", className)}
          data-testid={`${testId}:input`}
        />
        {children}
      </label>
    </fieldset>
  );
}
