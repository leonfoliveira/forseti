import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { renderHook } from "@testing-library/react";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { MemberType } from "../../../src/core/domain/enumerate/MemberType";

describe("useContestFormatter", () => {
  it("formats contest status correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(result.current.formatStatus(ContestStatus.IN_PROGRESS)).toBe(
      "contest-status.IN_PROGRESS",
    );
  });

  it("formats language correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(result.current.formatLanguage(Language.PYTHON_3_13)).toBe(
      "language.PYTHON_3_13",
    );
  });

  it("formats submission status correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(result.current.formatSubmissionStatus(SubmissionStatus.JUDGED)).toBe(
      "submission-status.JUDGED",
    );
  });

  it("formats submission answer correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(
      result.current.formatSubmissionAnswer(SubmissionAnswer.ACCEPTED),
    ).toBe("submission-answer.ACCEPTED");
  });

  it("formats submission answer short correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(
      result.current.formatSubmissionAnswerShort(SubmissionAnswer.WRONG_ANSWER),
    ).toBe("submission-answer-short.WRONG_ANSWER");
  });

  it("formats member type correctly", () => {
    const { result } = renderHook(() => useContestFormatter());
    expect(result.current.formatMemberType(MemberType.CONTESTANT)).toBe(
      "member-type.CONTESTANT",
    );
  });
});
