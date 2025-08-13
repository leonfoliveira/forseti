import React from "react";
import { FormattedMessage } from "react-intl";

import { cls } from "@/app/_util/cls";
import { Message } from "@/i18n/message";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  "data-testid"?: string;
  label: Message;
};

/**
 * Checkbox component
 */
export function Checkbox({ className, label, ...props }: Props) {
  const testId = props["data-testid"] || "checkbox";

  return (
    <fieldset data-testid={`${testId}:container`}>
      <label
        className="label"
        htmlFor={props.name}
        data-testid={`${testId}:label`}
      >
        <input
          type="checkbox"
          {...props}
          id={props.name}
          className={cls("toggle", className)}
          data-testid={testId}
        />
        <FormattedMessage {...label} />
      </label>
    </fieldset>
  );
}
