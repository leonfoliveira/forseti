import { cls } from "@/app/_util/cls";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "success" | "warning" | "danger";
};

export function Badge({ children, variant = "primary", className }: Props) {
  const styles = {
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cls(
        "inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
