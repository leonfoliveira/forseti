import React from "react";

type Props = React.HTMLProps<HTMLTableSectionElement> & {
  head?: boolean;
  "data-testid"?: string;
};

export function TableSection({ head, children, ...props }: Props) {
  const testId = props["data-testid"] || "table-section";

  if (head) {
    return (
      <thead {...props} data-testid={testId}>
        {children}
      </thead>
    );
  }
  return (
    <tbody {...props} data-testid={testId}>
      {children}
    </tbody>
  );
}
