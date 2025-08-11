import { render, screen } from "@testing-library/react";

import { SubmissionAnswerShortBadge } from "@/app/_component/badge/submission-answer-short-badge";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

jest.mock("@/app/_component/badge/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span className={className} data-testid="badge">
      {children}
    </span>
  ),
}));

describe("SubmissionAnswerShortBadge", () => {
  it.each([
    [SubmissionAnswer.ACCEPTED, "badge-success"],
    [SubmissionAnswer.WRONG_ANSWER, "badge-error"],
    [SubmissionAnswer.TIME_LIMIT_EXCEEDED, "badge-info"],
    [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED, "badge-info"],
    [SubmissionAnswer.COMPILATION_ERROR, "badge-warning"],
    [SubmissionAnswer.RUNTIME_ERROR, "badge-warning"],
  ])("should render %s with correct class", (answer, expectedClass) => {
    const amount = 2;
    render(
      <SubmissionAnswerShortBadge
        answer={answer}
        amount={amount}
        className="custom-class"
      />
    );
    const badge = screen.getByTestId("badge");
    expect(badge).toHaveClass(expectedClass);
    expect(badge).toHaveTextContent("{answer} x{amount}");
    expect(badge).toHaveClass("custom-class");
  });
});
