import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
} from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { cls } from "@/app/_util/cls";
import { Message } from "@/i18n/message";
import { Spinner } from "@/lib/component/spinner";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  "data-testid"?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: Message;
  isLoading?: boolean;
  tooltip?: Message;
  containerClassName?: string;
};

/**
 * Button component that renders a button with optional loading state.
 */
export function Button({
  type,
  leftIcon,
  rightIcon,
  label,
  isLoading,
  tooltip,
  containerClassName,
  disabled,
  ...props
}: Props) {
  const testId = props["data-testid"] || "button";
  const intl = useIntl();
  const tooltipMessage = intl.formatMessage({ ...tooltip });

  return (
    <div
      className={cls(
        containerClassName,
        tooltip && "tooltip",
        !isLoading && disabled && "cursor-not-allowed",
        isLoading && "cursor-wait",
      )}
      data-tip={tooltipMessage}
      data-testid={`${testId}:container`}
    >
      <button
        type={type || "button"}
        {...props}
        disabled={disabled || isLoading}
        className={cls(props.className, "btn")}
        aria-label={tooltipMessage}
        data-testid={testId}
      >
        {!isLoading ? (
          <>
            {leftIcon}
            {label && <FormattedMessage {...label} />}
            {rightIcon}
          </>
        ) : (
          <Spinner data-testid={`${testId}:spinner`} />
        )}
      </button>
    </div>
  );
}
