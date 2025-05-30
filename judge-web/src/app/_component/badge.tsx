import { cls } from "@/app/_util/cls";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function Badge({ children, className, ...props }: Props) {
  return (
    <span className={cls("badge", className)} {...props}>
      {children}
    </span>
  );
}
