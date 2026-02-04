import React from "react";

import { cls } from "@/app/_lib/util/cls";

type GridTableElementProps = React.HTMLProps<HTMLDivElement>;

export type GridTableProps = GridTableElementProps;

/**
 * A grid-based table component.
 * Used to display tabular data in a flexible grid layout.
 */
export function GridTable({ children, className, ...props }: GridTableProps) {
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

export type GridTableHeaderProps = GridTableElementProps;

/**
 * The header section of the GridTable.
 * Contains column headers.
 */
GridTable.Header = function GridTableHeader({
  children,
  className,
  ...props
}: GridTableHeaderProps) {
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
};

export type GridTableColumnProps = GridTableElementProps;

/**
 * A single column header in the GridTable.
 */
GridTable.Column = function GridTableColumn({
  children,
  className,
  ...props
}: GridTableColumnProps) {
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
};

export type GridTableBodyProps = GridTableElementProps & {
  emptyContent?: React.ReactNode;
};

/**
 * The body section of the GridTable.
 * Contains rows of data.
 */
GridTable.Body = function GridTableBody({
  children,
  className,
  emptyContent,
  ...props
}: GridTableBodyProps) {
  return (
    <div {...props} className={cls("contents", className)} role="rowgroup">
      {children || (
        <div className="col-span-full flex justify-center items-center py-20 text-neutral-400">
          {emptyContent}
        </div>
      )}
    </div>
  );
};

export type GridTableRowProps = GridTableElementProps;

/**
 * A single row in the GridTable.
 */
GridTable.Row = function GridTableRow({
  children,
  className,
  ...props
}: GridTableRowProps) {
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
};

export type GridTableCellProps = GridTableElementProps;

/**
 * A single cell in the GridTable.
 */
GridTable.Cell = function GridTableCell({
  children,
  className,
  ...props
}: GridTableCellProps) {
  return (
    <div
      {...props}
      className={cls("h-full py-2 px-4 text-sm flex items-center", className)}
      role="cell"
    >
      {children}
    </div>
  );
};
