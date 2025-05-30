import { render, screen } from "@testing-library/react";
import { TableSection } from "@/app/_component/table/table-section";
import React from "react";

function Table({ children }: { children: React.ReactNode }) {
  return <table>{children}</table>;
}

it("renders as a thead element when head prop is true", () => {
  render(
    <Table>
      <TableSection head data-testid="table-section">
        <tr>
          <th>Header Content</th>
        </tr>
      </TableSection>
    </Table>,
  );
  const section = screen.getByTestId("table-section");
  expect(section.tagName).toBe("THEAD");
  expect(screen.getByText("Header Content")).toBeInTheDocument();
});

it("renders as a tbody element when head prop is false", () => {
  render(
    <Table>
      <TableSection data-testid="table-section">
        <tr>
          <td>Body Content</td>
        </tr>
      </TableSection>
    </Table>,
  );
  const section = screen.getByTestId("table-section");
  expect(section.tagName).toBe("TBODY");
  expect(screen.getByText("Body Content")).toBeInTheDocument();
});

it("applies additional props to the table section element", () => {
  render(
    <Table>
      <TableSection data-testid="table-section" role="rowgroup">
        <tr>
          <td>Content</td>
        </tr>
      </TableSection>
    </Table>,
  );
  const section = screen.getByTestId("table-section");
  expect(section).toHaveAttribute("role", "rowgroup");
});

it("renders without crashing when no children are provided", () => {
  render(
    <Table>
      <TableSection data-testid="table-section" />
    </Table>,
  );
  const section = screen.getByTestId("table-section");
  expect(section).toBeInTheDocument();
});
