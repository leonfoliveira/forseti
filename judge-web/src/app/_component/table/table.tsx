import React, { DetailedHTMLProps, TableHTMLAttributes } from "react";
import { cls } from "@/app/_util/cls";

export function Table({
  children,
  className,
  ...props
}: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>) {
  return (
    <table {...props} className={cls("table", className)}>
      {children}
    </table>
  );
}
