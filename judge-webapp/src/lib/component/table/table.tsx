import React, { DetailedHTMLProps, TableHTMLAttributes } from "react";

import { cls } from "@/app/_util/cls";

type Props = DetailedHTMLProps<
  TableHTMLAttributes<HTMLTableElement>,
  HTMLTableElement
> & {
  "data-testid"?: string;
};

/**
 * Table component for displaying tabular data.
 */
export function Table({ children, className, ...props }: Props) {
  const testId = props["data-testid"] || "table";

  return (
    <table {...props} className={cls("table", className)} data-testid={testId}>
      {children}
    </table>
  );
}
