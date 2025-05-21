import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: "primary" | "outline-primary" | "outline-danger";
};

export function Button({ type, variant = "primary", ...props }: Props) {
  const styles = {
    primary:
      "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300",
    "outline-primary":
      "border border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:bg-blue-200",
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
