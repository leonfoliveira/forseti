import { render, screen } from "@testing-library/react";

import { Table } from "@/app/_component/table/table";

describe("Table", () => {
  it("renders a table with the given children", () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </Table>,
    );
    const table = screen.getByTestId("table");
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent("Test");
  });

  it("applies the given className to the table", () => {
    render(
      <Table className="my-class">
        <tbody>
          <tr>
            <td>Test</td>
          </tr>
        </tbody>
      </Table>,
    );
    const table = screen.getByTestId("table");
    expect(table).toHaveClass("my-class");
  });
});
