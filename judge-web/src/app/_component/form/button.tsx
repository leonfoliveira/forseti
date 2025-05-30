import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  "data-testid"?: string;
};

export function Button({ type, ...props }: Props) {
  return (
    <button
      type={type || "button"}
      {...props}
      className={cls(props.className, "btn")}
      data-testid={props["data-testid"] || "button"}
    >
      {props.children}
    </button>
  );
}
