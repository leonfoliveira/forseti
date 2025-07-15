import { render, screen } from "@testing-library/react";
import { TableSection } from "@/app/_component/table/table-section";

describe("TableSection", () => {
  it("should render table section as tbody by default", () => {
    render(<TableSection>Test Body</TableSection>);
    const section = screen.getByTestId("table-section");

    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe("TBODY");
    expect(section).toHaveTextContent("Test Body");
  });

  it("should render table section as thead when head prop is true", () => {
    render(<TableSection head={true}>Test Head</TableSection>);
    const section = screen.getByTestId("table-section");

    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe("THEAD");
    expect(section).toHaveTextContent("Test Head");
  });
});
