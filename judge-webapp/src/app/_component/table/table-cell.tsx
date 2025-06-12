import React from "react";
import { cls } from "@/app/_util/cls";

type Props = React.HTMLProps<HTMLTableCellElement> & {
  header?: boolean;
  align?: "left" | "right" | "center";
  "data-testid"?: string;
};

export function TableCell({
  header = false,
  children,
  align = "left",
  className,
  ...props
}: Props) {
  const testId =
    props["data-testid"] || (header ? "table-header-cell" : "table-cell");

  const alignStyle = {
    left: "text-start",
    right: "text-end",
    center: "text-center",
  }[align];
  const baseStyle = "py-1 px-2";

  if (header) {
    return (
      <th
        {...props}
        className={cls(baseStyle, alignStyle, className)}
        data-testid={testId}
      >
        {children}
      </th>
    );
  }
  return (
    <td
      {...props}
      className={cls(baseStyle, alignStyle, className)}
      data-testid={testId}
    >
      {children}
    </td>
  );
}
