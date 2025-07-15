import { Table } from "@/app/_component/table/table";
import { render, screen } from "@testing-library/react";

describe("Table", () => {
  it("should render table", () => {
    render(<Table />);

    expect(screen.getByTestId("table")).toBeInTheDocument();
  });
});
