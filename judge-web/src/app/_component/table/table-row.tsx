import React from "react";

type Props = React.HTMLProps<HTMLTableRowElement> & {
  "data-testid"?: string;
};

export function TableRow({ children, ...props }: Props) {
  return <tr {...props}>{children}</tr>;
}
