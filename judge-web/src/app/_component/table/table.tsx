import React, { DetailedHTMLProps, TableHTMLAttributes } from "react";
import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  TableHTMLAttributes<HTMLTableElement>,
  HTMLTableElement
> & {
  "data-testid"?: string;
};

export function Table({ children, className, ...props }: Props) {
  return (
    <table {...props} className={cls("table", className)}>
      {children}
    </table>
  );
}
