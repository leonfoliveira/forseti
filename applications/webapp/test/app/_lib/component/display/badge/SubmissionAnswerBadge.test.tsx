import { screen } from "@testing-library/react";

import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/SubmissionAnswerBadge";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";
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
  ])("shows the %s answer", async (answer, text, id) => {
    await renderWithProviders(<SubmissionAnswerBadge answer={answer} />);
    expect(screen.getByTestId(id)).toHaveTextContent(text);
  });
});
