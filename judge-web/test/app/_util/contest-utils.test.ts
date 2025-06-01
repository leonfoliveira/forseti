import { getContestStatus } from "@/app/_util/contest-utils";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { renderHook } from "@testing-library/react";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

describe("getContestStatus", () => {
  it("returns NOT_STARTED when current time is before contest start time", () => {
    const contest = {
      startAt: new Date(Date.now() + 10000).toISOString(),
      endAt: new Date(Date.now() + 20000).toISOString(),
    } as ContestSummaryResponseDTO;
    expect(getContestStatus(contest)).toBe(ContestStatus.NOT_STARTED);
  });

  it("returns IN_PROGRESS when current time is between contest start and end time", () => {
    const contest = {
      startAt: new Date(Date.now() - 10000).toISOString(),
      endAt: new Date(Date.now() + 10000).toISOString(),
    } as ContestSummaryResponseDTO;
    expect(getContestStatus(contest)).toBe(ContestStatus.IN_PROGRESS);
  });

  it("returns ENDED when current time is after contest end time", () => {
    const contest = {
      startAt: new Date(Date.now() - 20000).toISOString(),
      endAt: new Date(Date.now() - 10000).toISOString(),
    } as ContestSummaryResponseDTO;
    expect(getContestStatus(contest)).toBe(ContestStatus.ENDED);
  });
});

describe("formatStatus", () => {
  const {
    result: {
      current: { formatStatus },
    },
  } = renderHook(() => useContestFormatter());

  it("formats NOT_STARTED status correctly", () => {
    expect(formatStatus(ContestStatus.NOT_STARTED)).toBe(
      "contest-status.NOT_STARTED",
    );
  });

  it("formats IN_PROGRESS status correctly", () => {
    expect(formatStatus(ContestStatus.IN_PROGRESS)).toBe(
      "contest-status.IN_PROGRESS",
    );
  });

  it("formats ENDED status correctly", () => {
    expect(formatStatus(ContestStatus.ENDED)).toBe("contest-status.ENDED");
  });
});

describe("formatLanguage", () => {
  const {
    result: {
      current: { formatLanguage },
    },
  } = renderHook(() => useContestFormatter());

  it("formats Python 3.13.3 language correctly", () => {
    expect(formatLanguage(Language.PYTHON_3_13_3)).toBe(
      "language.PYTHON_3_13_3",
    );
  });
});

describe("formatSubmissionStatus", () => {
  const {
    result: {
      current: { formatSubmissionStatus },
    },
  } = renderHook(() => useContestFormatter());

  it("formats JUDGING status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.JUDGING)).toBe(
      "submission-status.JUDGING",
    );
  });

  it("formats ACCEPTED status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.ACCEPTED)).toBe(
      "submission-status.ACCEPTED",
    );
  });

  it("formats WRONG_ANSWER status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.WRONG_ANSWER)).toBe(
      "submission-status.WRONG_ANSWER",
    );
  });

  it("formats TIME_LIMIT_EXCEEDED status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.TIME_LIMIT_EXCEEDED)).toBe(
      "submission-status.TIME_LIMIT_EXCEEDED",
    );
  });

  it("formats COMPILATION_ERROR status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.COMPILATION_ERROR)).toBe(
      "submission-status.COMPILATION_ERROR",
    );
  });

  it("formats RUNTIME_ERROR status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.RUNTIME_ERROR)).toBe(
      "submission-status.RUNTIME_ERROR",
    );
  });
});
