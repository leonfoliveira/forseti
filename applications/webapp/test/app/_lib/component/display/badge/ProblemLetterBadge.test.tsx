import { render, screen } from "@testing-library/react";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/ProblemLetterBadge";

describe("ProblemLetterBadge", () => {
  it("renders the letter, color, and title tooltip", () => {
    render(<ProblemLetterBadge problem={{ color: "#ffffff", letter: "B", title: "Second problem" }} />);
    expect(screen.getByTestId("problem-letter-badge")).toHaveStyle({ backgroundColor: "#ffffff" });
    expect(screen.getByTestId("problem-letter-badge")).toHaveTextContent("B");
    expect(screen.getByText("Second problem")).toBeInTheDocument();
  });
});
