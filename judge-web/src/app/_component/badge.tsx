import { cls } from "@/app/_util/cls";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: Props) {
  return <span className={cls("badge", className)}>{children}</span>;
}
