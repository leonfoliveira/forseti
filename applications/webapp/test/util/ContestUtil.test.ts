import { ContestStatus } from "@/domain/enumerate/ContestStatus";
import { ContestUtil } from "@/util/ContestUtil";

describe("ContestUtil", () => {
  beforeEach(() => {
    jest.setSystemTime(new Date("2026-05-15T12:00:00.000Z"));
  });

  it("returns NOT_STARTED before a contest begins", () => {
    expect(
      ContestUtil.getStatus({
        startAt: "2026-05-15T12:00:01.000Z",
        endAt: "2026-05-15T13:00:00.000Z",
      }),
    ).toBe(ContestStatus.NOT_STARTED);
  });

  it("treats both start and end instants as in progress", () => {
    expect(
      ContestUtil.getStatus({
        startAt: "2026-05-15T12:00:00.000Z",
        endAt: "2026-05-15T13:00:00.000Z",
      }),
    ).toBe(ContestStatus.IN_PROGRESS);
    expect(
      ContestUtil.getStatus({
        startAt: "2026-05-15T11:00:00.000Z",
        endAt: "2026-05-15T12:00:00.000Z",
      }),
    ).toBe(ContestStatus.IN_PROGRESS);
  });

  it("returns ENDED after the contest ends", () => {
    expect(
      ContestUtil.getStatus({
        startAt: "2026-05-15T10:00:00.000Z",
        endAt: "2026-05-15T11:59:59.000Z",
      }),
    ).toBe(ContestStatus.ENDED);
  });
});
