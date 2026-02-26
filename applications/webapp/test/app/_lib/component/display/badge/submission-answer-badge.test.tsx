import { screen } from "@testing-library/dom";

import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/submission-answer-chip";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionAnswerBadge", () => {
  it.each([
    [SubmissionAnswer.ACCEPTED, "Accepted", "badge-accepted"],
    [SubmissionAnswer.WRONG_ANSWER, "Wrong Answer", "badge-wrong-answer"],
    [
      SubmissionAnswer.TIME_LIMIT_EXCEEDED,
      "Time Limit Exceeded",
      "badge-wrong-answer",
    ],
    [
      SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
      "Memory Limit Exceeded",
      "badge-wrong-answer",
    ],
    [SubmissionAnswer.RUNTIME_ERROR, "Runtime Error", "badge-error"],
    [SubmissionAnswer.COMPILATION_ERROR, "Compilation Error", "badge-error"],
  ])(
    "should render correctly for %s",
    async (answer, expectedText, expectedTestId) => {
      await renderWithProviders(<SubmissionAnswerBadge answer={answer} />);

      const badge = screen.getByTestId(expectedTestId);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent(expectedText);
    },
  );
});
