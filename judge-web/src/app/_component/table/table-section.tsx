import React from "react";

type Props = React.HTMLProps<HTMLTableSectionElement> & {
  head?: boolean;
  "data-testid"?: string;
};

export function TableSection({ head, children, ...props }: Props) {
  if (head) {
    return <thead {...props}>{children}</thead>;
  }
  return <tbody {...props}>{children}</tbody>;
}
