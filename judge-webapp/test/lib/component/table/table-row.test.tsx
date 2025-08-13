import { render, screen } from "@testing-library/react";

import { TableRow } from "@/lib/component/table/table-row";

describe("TableRow", () => {
  it("renders a table row with the given children", () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>Test</td>
          </TableRow>
        </tbody>
      </table>,
    );
    const tableRow = screen.getByTestId("table-row");
    expect(tableRow).toBeInTheDocument();
    expect(tableRow).toHaveTextContent("Test");
  });
});
