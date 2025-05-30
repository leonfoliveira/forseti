import { render, screen } from "@testing-library/react";
import { Table } from "@/app/_component/table/table";

it("renders the table with the provided className", () => {
  render(
    <Table className="custom-class" data-testid="table">
      <tbody>
        <tr>
          <td>Content</td>
        </tr>
      </tbody>
    </Table>,
  );
  const table = screen.getByTestId("table");
  expect(table).toHaveClass("table custom-class");
});

it("renders the table with children elements", () => {
  render(
    <Table data-testid="table">
      <tbody>
        <tr>
          <td>Row Content</td>
        </tr>
      </tbody>
    </Table>,
  );
  expect(screen.getByText("Row Content")).toBeInTheDocument();
});

it("applies additional props to the table element", () => {
  render(
    <Table data-testid="table" role="grid">
      <tbody>
        <tr>
          <td>Content</td>
        </tr>
      </tbody>
    </Table>,
  );
  const table = screen.getByTestId("table");
  expect(table).toHaveAttribute("role", "grid");
});

it("renders without crashing when no children are provided", () => {
  render(<Table data-testid="table" />);
  const table = screen.getByTestId("table");
  expect(table).toBeInTheDocument();
});
