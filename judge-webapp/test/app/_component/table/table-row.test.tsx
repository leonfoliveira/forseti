import { TableRow } from "@/app/_component/table/table-row";
import { render, screen } from "@testing-library/react";

describe("TableRow", () => {
  it("should render table row", () => {
    render(<TableRow>Test Row</TableRow>);
    const row = screen.getByTestId("table-row");

    expect(row).toBeInTheDocument();
    expect(row).toHaveTextContent("Test Row");
  });
});
