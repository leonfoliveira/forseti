import { render, screen } from "@testing-library/react";

import { Badge } from "@/app/_component/badge/badge";

describe("Badge", () => {
  it("renders a badge with the given children", () => {
    render(<Badge>My badge</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("My badge");
  });

  it("applies the given className to the badge", () => {
    render(<Badge className="my-class">My badge</Badge>);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass("my-class");
  });
});
