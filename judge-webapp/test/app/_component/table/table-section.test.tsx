import { render, screen } from "@testing-library/react";
import { TableSection } from "@/app/_component/table/table-section";

describe("TableSection", () => {
  it("renders a tbody by default", () => {
    render(
      <table>
        <TableSection>
          <tr>
            <td>Test</td>
          </tr>
        </TableSection>
      </table>,
    );
    const tableSection = screen.getByTestId("table-section");
    expect(tableSection.tagName).toBe("TBODY");
    expect(tableSection).toHaveTextContent("Test");
  });

  it("renders a thead when head prop is true", () => {
    render(
      <table>
        <TableSection head>
          <tr>
            <td>Test</td>
          </tr>
        </TableSection>
      </table>,
    );
    const tableSection = screen.getByTestId("table-section");
    expect(tableSection.tagName).toBe("THEAD");
    expect(tableSection).toHaveTextContent("Test");
  });
});
