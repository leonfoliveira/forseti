import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";
import { Spinner } from "@/app/_component/spinner";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  "data-testid"?: string;
  isLoading?: boolean;
  tooltip?: string;
  containerClassName?: string;
};

/**
 * Button component that renders a button with optional loading state.
 */
export function Button({
  type,
  isLoading,
  tooltip,
  containerClassName,
  disabled,
  ...props
}: Props) {
  const testId = props["data-testid"] || "button";

  return (
    <div
      className={cls(
        containerClassName,
        tooltip && "tooltip",
        !isLoading && disabled && "cursor-not-allowed",
        isLoading && "cursor-wait",
      )}
      data-tip={tooltip}
      data-testid={`${testId}:container`}
    >
      <button
        type={type || "button"}
        {...props}
        disabled={disabled || isLoading}
        className={cls(props.className, "btn")}
        data-testid={testId}
      >
        {!isLoading && props.children}
        {isLoading && <Spinner data-testid={`${testId}:spinner`} />}
      </button>
    </div>
  );
}
