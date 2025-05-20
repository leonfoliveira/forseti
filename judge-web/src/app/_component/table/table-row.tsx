import React from "react";

export function TableRow({
  children,
  ...props
}: React.HTMLProps<HTMLTableRowElement>) {
  return <tr {...props}>{children}</tr>;
}
