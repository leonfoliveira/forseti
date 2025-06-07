import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { renderHook } from "@testing-library/react";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

describe("useContestFormatter", () => {
  it("returns the correct translation for contest status", () => {
    const t = jest.fn((key) => key);
    jest.spyOn(require("next-intl"), "useTranslations").mockReturnValue(t);

    const {
      result: { current },
    } = renderHook(() => useContestFormatter());
    const { formatStatus } = current;
    const result = formatStatus(ContestStatus.ENDED);

    expect(t).toHaveBeenCalledWith("contest-status.ENDED");
    expect(result).toBe("contest-status.ENDED");
  });

  it("returns the correct translation for language", () => {
    const t = jest.fn((key) => key);
    jest.spyOn(require("next-intl"), "useTranslations").mockReturnValue(t);

    const {
      result: { current },
    } = renderHook(() => useContestFormatter());
    const { formatLanguage } = current;
    const result = formatLanguage(Language.PYTHON_3_13_3);

    expect(t).toHaveBeenCalledWith("language.PYTHON_3_13_3");
    expect(result).toBe("language.PYTHON_3_13_3");
  });

  it("returns the correct translation for submission status", () => {
    const t = jest.fn((key) => key);
    jest.spyOn(require("next-intl"), "useTranslations").mockReturnValue(t);

    const {
      result: { current },
    } = renderHook(() => useContestFormatter());
    const { formatSubmissionStatus } = current;
    const result = formatSubmissionStatus(SubmissionStatus.JUDGED);

    expect(t).toHaveBeenCalledWith("submission-status.JUDGED");
    expect(result).toBe("submission-status.JUDGED");
  });

  it("returns the correct translation for submission answer", () => {
    const t = jest.fn((key) => key);
    jest.spyOn(require("next-intl"), "useTranslations").mockReturnValue(t);

    const {
      result: { current },
    } = renderHook(() => useContestFormatter());
    const { formatSubmissionAnswer } = current;
    const result = formatSubmissionAnswer(SubmissionAnswer.ACCEPTED);

    expect(t).toHaveBeenCalledWith("submission-answer.ACCEPTED");
    expect(result).toBe("submission-answer.ACCEPTED");
  });
});
