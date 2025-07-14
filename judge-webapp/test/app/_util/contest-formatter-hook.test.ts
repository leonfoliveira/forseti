import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

describe("useContestFormatter", () => {
  it("should format contest status", () => {
    const { formatStatus } = useContestFormatter();

    expect(formatStatus(ContestStatus.IN_PROGRESS)).toBe(
      "contest-status.IN_PROGRESS",
    );
  });

  it("should format language", () => {
    const { formatLanguage } = useContestFormatter();

    expect(formatLanguage(Language.PYTHON_3_13_3)).toBe(
      "language.PYTHON_3_13_3",
    );
  });

  it("should format submission status", () => {
    const { formatSubmissionStatus } = useContestFormatter();

    expect(formatSubmissionStatus(SubmissionStatus.JUDGED)).toBe(
      "submission-status.JUDGED",
    );
  });

  it("should format submission answer", () => {
    const { formatSubmissionAnswer } = useContestFormatter();

    expect(formatSubmissionAnswer(SubmissionAnswer.ACCEPTED)).toBe(
      "submission-answer.ACCEPTED",
    );
  });

  it("should format submission answer short", () => {
    const { formatSubmissionAnswerShort } = useContestFormatter();

    expect(formatSubmissionAnswerShort(SubmissionAnswer.ACCEPTED)).toBe(
      "submission-answer-short.ACCEPTED",
    );
  });
});
