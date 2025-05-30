import { render, screen } from "@testing-library/react";
import { Badge } from "@/app/_component/badge";

it("renders the badge with the provided className", () => {
  render(
    <Badge className="custom-class" data-testid="badge">
      Badge Content
    </Badge>,
  );
  const badge = screen.getByTestId("badge");
  expect(badge).toHaveClass("badge custom-class");
});

it("renders the badge with children elements", () => {
  render(<Badge data-testid="badge">Badge Content</Badge>);
  expect(screen.getByText("Badge Content")).toBeInTheDocument();
});
