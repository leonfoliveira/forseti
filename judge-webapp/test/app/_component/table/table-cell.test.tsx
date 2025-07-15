import { TableCell } from "@/app/_component/table/table-cell";
import { render, screen } from "@testing-library/react";

describe("TableCell", () => {
  it("should render table cell", () => {
    render(<TableCell>Test Cell</TableCell>);
    const cell = screen.getByTestId("table-cell");

    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent("Test Cell");
  });

  it("should render header cell", () => {
    render(<TableCell header={true}>Header Cell</TableCell>);
    const headerCell = screen.getByTestId("table-header-cell");

    expect(headerCell).toBeInTheDocument();
    expect(headerCell).toHaveTextContent("Header Cell");
  });

  it("should apply alignment classes", () => {
    render(<TableCell align="right">Right Aligned Cell</TableCell>);
    const cell = screen.getByTestId("table-cell");

    expect(cell).toHaveClass("text-end");
  });
});
