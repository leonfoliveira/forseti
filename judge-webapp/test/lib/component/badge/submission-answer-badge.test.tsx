import { render, screen } from "@testing-library/react";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionAnswerBadge } from "@/lib/component/badge/submission-answer-badge";

jest.mock("@/lib/component/badge/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

describe("SubmissionAnswerBadge", () => {
  it.each([
    [SubmissionAnswer.NO_ANSWER, "badge-neutral"],
    [SubmissionAnswer.ACCEPTED, "badge-success"],
    [SubmissionAnswer.WRONG_ANSWER, "badge-error"],
    [SubmissionAnswer.TIME_LIMIT_EXCEEDED, "badge-info"],
    [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED, "badge-info"],
    [SubmissionAnswer.RUNTIME_ERROR, "badge-warning"],
    [SubmissionAnswer.COMPILATION_ERROR, "badge-warning"],
  ])("should render %s with correct class", (answer, expectedClass) => {
    render(<SubmissionAnswerBadge answer={answer} />);
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass(expectedClass);
    expect(badge).not.toBeEmptyDOMElement();
  });
});
