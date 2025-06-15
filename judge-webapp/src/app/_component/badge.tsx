import { cls } from "@/app/_util/cls";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
};

/**
 * Badge component renders a styled badge element.
 */
export function Badge({ children, className, ...props }: Props) {
  const testId = props["data-testid"] || "badge";

  return (
    <span className={cls(className, "badge")} data-testid={testId} {...props}>
      {children}
    </span>
  );
}
