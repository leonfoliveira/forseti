import { render, screen } from "@testing-library/react";
import { TableRow } from "@/app/_component/table/table-row";
import React from "react";

function Table({ children }: { children: React.ReactNode }) {
  return (
    <table>
      <tbody>{children}</tbody>
    </table>
  );
}

it("renders the table row with the provided className", () => {
  render(
    <Table>
      <TableRow className="custom-class" data-testid="table-row">
        <td>Content</td>
      </TableRow>
    </Table>,
  );
  const row = screen.getByTestId("table-row");
  expect(row).toHaveClass("custom-class");
});

it("applies additional props to the table row element", () => {
  render(
    <Table>
      <TableRow data-testid="table-row" role="row">
        <td>Content</td>
      </TableRow>
    </Table>,
  );
  const row = screen.getByTestId("table-row");
  expect(row).toHaveAttribute("role", "row");
});

it("renders without crashing when no children are provided", () => {
  render(
    <Table>
      <TableRow data-testid="table-row" />
    </Table>,
  );
  const row = screen.getByTestId("table-row");
  expect(row).toBeInTheDocument();
});
