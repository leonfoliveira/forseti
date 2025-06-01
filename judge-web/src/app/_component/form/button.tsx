import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";
import { Spinner } from "@/app/_component/spinner";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  "data-testid"?: string;
  isLoading?: boolean;
};

export function Button({ type, isLoading, ...props }: Props) {
  const testId = props["data-testid"] || "button";

  return (
    <button
      type={type || "button"}
      {...props}
      className={cls(props.className, "btn")}
      data-testid={testId}
    >
      {!isLoading && props.children}
      {isLoading && <Spinner data-testid={`${testId}:spinner`} />}
    </button>
  );
}
