import { render, screen } from "@testing-library/react";
import { Badge } from "@/app/_component/badge";

describe("Badge", () => {
  it("renders with default class", () => {
    render(<Badge>Test Badge</Badge>);
    const badgeElement = screen.getByText("Test Badge");
    expect(badgeElement).toBeInTheDocument();
    expect(badgeElement).toHaveClass("badge");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badgeElement = screen.getByText("Custom Badge");
    expect(badgeElement).toHaveClass("custom-class");
  });
});
