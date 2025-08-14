import { render, screen } from "@testing-library/react";

import { TableCell } from "@/lib/component/table/table-cell";

describe("TableCell", () => {
  it("renders a td by default", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Test</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    const tableCell = screen.getByTestId("table-cell");
    expect(tableCell).toBeInTheDocument();
    expect(tableCell.tagName).toBe("TD");
    expect(tableCell).toHaveTextContent("Test");
  });

  it("renders a th when header prop is true", () => {
    render(
      <table>
        <thead>
          <tr>
            <TableCell header>Test</TableCell>
          </tr>
        </thead>
      </table>,
    );
    const tableCell = screen.getByTestId("table-header-cell");
    expect(tableCell).toBeInTheDocument();
    expect(tableCell.tagName).toBe("TH");
    expect(tableCell).toHaveTextContent("Test");
  });

  it("applies the given className to the cell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="my-class">Test</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    const tableCell = screen.getByTestId("table-cell");
    expect(tableCell).toHaveClass("my-class");
  });

  it("applies left alignment", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell align="left">Test</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    const tableCell = screen.getByTestId("table-cell");
    expect(tableCell).toHaveClass("text-start");
  });

  it("applies right alignment", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell align="right">Test</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    const tableCell = screen.getByTestId("table-cell");
    expect(tableCell).toHaveClass("text-end");
  });

  it("applies center alignment", () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell align="center">Test</TableCell>
          </tr>
        </tbody>
      </table>,
    );
    const tableCell = screen.getByTestId("table-cell");
    expect(tableCell).toHaveClass("text-center");
  });
});
