import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?:
    | "primary"
    | "warning"
    | "danger"
    | "outline-primary"
    | "outline-warning"
    | "outline-danger";
};

export function Button({ type, variant = "primary", ...props }: Props) {
  const styles = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 disabled:bg-yellow-300",
    danger:
      "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300",
    "outline-primary":
      "border border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:bg-blue-200",
    "outline-warning":
      "border border-yellow-500 text-yellow-500 hover:bg-yellow-50 active:bg-yellow-100 disabled:bg-yellow-200",
    "outline-danger":
      "border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100 disabled:bg-red-200",
  };

  return (
    <button
      type={type || "button"}
      {...props}
      className={cls(
        "font-semibold rounded-lg px-6 py-2 cursor-pointer transition",
        styles[variant],
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
