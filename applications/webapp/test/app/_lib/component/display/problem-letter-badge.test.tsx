import { screen } from "@testing-library/dom";

import { ProblemLetterBadge } from "@/app/_lib/component/display/badge/problem-letter-badge";
import { ColorUtil } from "@/app/_lib/util/color-util";
import { MockProblemResponseDTO } from "@/test/mock/response/problem/MockProblemResponseDTO";
import { renderWithProviders } from "@/test/render-with-providers";

describe("ProblemLetterBadge", () => {
  it("should render the problem letter with the correct color", async () => {
    const problem = MockProblemResponseDTO();
    await renderWithProviders(<ProblemLetterBadge problem={problem} />);

    const badge = screen.getByTestId("problem-letter-badge");
    expect(badge).toHaveTextContent(problem.letter);
    expect(badge).toHaveStyle(`background-color: ${problem.color}`);
    const span = badge.querySelector("span");
    expect(span).toHaveStyle(
      `color: ${ColorUtil.getForegroundColor(problem.color)}`,
    );
  });
});
