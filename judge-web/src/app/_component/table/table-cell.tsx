import React from "react";
import { cls } from "@/app/_util/cls";

type Props = React.HTMLProps<HTMLTableCellElement> & {
  header?: boolean;
};

export function TableCell({
  header = false,
  children,
  className,
  ...props
}: Props) {
  const baseStyle = "text-start p-1 border-b border-gray-200";

  if (header) {
    return (
      <th {...props} className={cls(baseStyle, className)}>
        {children}
      </th>
    );
  }
  return (
    <td {...props} className={cls(baseStyle, className)}>
      {children}
    </td>
  );
}
