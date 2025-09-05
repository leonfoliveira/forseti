import { screen } from "@testing-library/dom";

import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionAnswerChip } from "@/lib/component/chip/submission-answer-chip";
import { renderWithProviders } from "@/test/render-with-providers";

describe("SubmissionAnswerChip", () => {
  it.each([
    [SubmissionAnswer.NO_ANSWER, "Judging", "chip-no-answer"],
    [SubmissionAnswer.ACCEPTED, "Accepted", "chip-accepted"],
    [SubmissionAnswer.WRONG_ANSWER, "Wrong Answer", "chip-wrong-answer"],
    [
      SubmissionAnswer.TIME_LIMIT_EXCEEDED,
      "Time Limit Exceeded",
      "chip-limit-exceeded",
    ],
    [
      SubmissionAnswer.MEMORY_LIMIT_EXCEEDED,
      "Memory Limit Exceeded",
      "chip-limit-exceeded",
    ],
    [SubmissionAnswer.RUNTIME_ERROR, "Runtime Error", "chip-error"],
    [SubmissionAnswer.COMPILATION_ERROR, "Compilation Error", "chip-error"],
  ])(
    "should render correctly for %s",
    async (answer, expectedText, expectedTestId) => {
      await renderWithProviders(<SubmissionAnswerChip answer={answer} />);

      const chip = screen.getByTestId(expectedTestId);
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent(expectedText);
    },
  );
});
