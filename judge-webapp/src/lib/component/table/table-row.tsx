import React from "react";

type Props = React.HTMLProps<HTMLTableRowElement> & {
  "data-testid"?: string;
};

/**
 * TableRow component for rendering table rows.
 */
export function TableRow({ children, ...props }: Props) {
  const testId = props["data-testid"] || "table-row";
  return (
    <tr {...props} data-testid={testId}>
      {children}
    </tr>
  );
}
