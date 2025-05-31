import { render, screen } from "@testing-library/react";
import { TableCell } from "@/app/_component/table/table-cell";
import React from "react";

function Table({ children }: { children: React.ReactNode }) {
  return (
    <table>
      <tbody>
        <tr>{children}</tr>
      </tbody>
    </table>
  );
}

describe("TableCell Component", () => {
  it("renders as a table header cell when header prop is true", () => {
    render(
      <Table>
        <TableCell header data-testid="table-cell">
          Header Content
        </TableCell>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell.tagName).toBe("TH");
    expect(cell).toHaveTextContent("Header Content");
  });

  it("renders as a table data cell when header prop is false", () => {
    render(
      <Table>
        <TableCell data-testid="table-cell">Data Content</TableCell>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell.tagName).toBe("TD");
    expect(cell).toHaveTextContent("Data Content");
  });

  it("applies the correct alignment class based on the align prop", () => {
    render(
      <Table>
        <TableCell align="right" data-testid="table-cell">
          Header Content
        </TableCell>
      </Table>,
    );
    const cell = screen.getByTestId("table-cell");
    expect(cell).toHaveClass("text-end");
  });
});
