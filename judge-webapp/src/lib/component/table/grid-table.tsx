import React from "react";

import { cls } from "@/lib/util/cls";

type GridTableElementProps = React.HTMLProps<HTMLDivElement>;

export function GridTable({
  children,
  className,
  ...props
}: GridTableElementProps) {
  return (
    <div
      {...props}
      className={cls(`grid bg-content1 p-8 items-center`, className)}
      role="table"
    >
      {children}
    </div>
  );
}

export function GridTableHeader({
  children,
  className,
  ...props
}: GridTableElementProps) {
  return (
    <div {...props} className="contents" role="row">
      {React.Children.map(children, (child) => {
        if (!child || !React.isValidElement(child)) return child;

        const childElement = child as React.ReactElement<{
          className?: string;
        }>;
        return React.cloneElement(childElement, {
          className: cls(
            childElement.props.className,
            "contents bg-content3/50",
            className,
          ),
        });
      })}
    </div>
  );
}

export function GridTableColumn({
  children,
  className,
  ...props
}: GridTableElementProps) {
  return (
    <div
      {...props}
      className={cls(
        `py-2 px-4 font-semibold text-sm h-full flex items-center`,
        className,
      )}
      role="columnheader"
    >
      {children}
    </div>
  );
}

export function GridTableBody({
  children,
  className,
  emptyContent,
  ...props
}: GridTableElementProps & { emptyContent?: React.ReactNode }) {
  return (
    <div {...props} className={cls("contents", className)} role="rowgroup">
      {children || (
        <div className="col-span-full flex justify-center items-center py-20 text-neutral-400">
          {emptyContent}
        </div>
      )}
    </div>
  );
}

export function GridTableRow({
  children,
  className,
  ...props
}: GridTableElementProps) {
  return (
    <div {...props} className="contents" role="row">
      {React.Children.map(children, (child) => {
        if (!child || !React.isValidElement(child)) return child;

        const childElement = child as React.ReactElement<{
          className?: string;
        }>;
        return React.cloneElement(childElement, {
          className: cls(childElement.props.className, className),
        });
      })}
    </div>
  );
}

export function GridTableCell({
  children,
  className,
  ...props
}: GridTableElementProps) {
  return (
    <div
      {...props}
      className={cls("h-full py-2 px-4 text-sm flex items-center", className)}
      role="cell"
    >
      {children}
    </div>
  );
}
