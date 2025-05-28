import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export function Button({ type, ...props }: Props) {
  return (
    <button
      type={type || "button"}
      {...props}
      className={cls(props.className, "btn")}
    >
      {props.children}
    </button>
  );
}
