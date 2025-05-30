import {
  getContestStatus,
  formatStatus,
  formatLanguage,
  formatSubmissionStatus,
  ContestStatus,
} from "@/app/_util/contest-utils";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";

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
  it("formats NOT_STARTED status correctly", () => {
    expect(formatStatus(ContestStatus.NOT_STARTED)).toBe("Not Started");
  });

  it("formats IN_PROGRESS status correctly", () => {
    expect(formatStatus(ContestStatus.IN_PROGRESS)).toBe("In Progress");
  });

  it("formats ENDED status correctly", () => {
    expect(formatStatus(ContestStatus.ENDED)).toBe("Ended");
  });
});

describe("formatLanguage", () => {
  it("formats Python 3.13.3 language correctly", () => {
    expect(formatLanguage(Language.PYTHON_3_13_3)).toBe("Python 3.13.3");
  });
});

describe("formatSubmissionStatus", () => {
  it("formats JUDGING status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.JUDGING)).toBe("Judging");
  });

  it("formats ACCEPTED status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.ACCEPTED)).toBe("Accepted");
  });

  it("formats WRONG_ANSWER status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.WRONG_ANSWER)).toBe(
      "Wrong Answer",
    );
  });

  it("formats TIME_LIMIT_EXCEEDED status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.TIME_LIMIT_EXCEEDED)).toBe(
      "Time Limit Exceeded",
    );
  });

  it("formats COMPILATION_ERROR status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.COMPILATION_ERROR)).toBe(
      "Compilation Error",
    );
  });

  it("formats RUNTIME_ERROR status correctly", () => {
    expect(formatSubmissionStatus(SubmissionStatus.RUNTIME_ERROR)).toBe(
      "Runtime Error",
    );
  });
});
