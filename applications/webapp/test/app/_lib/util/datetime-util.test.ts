import { DateTimeUtil } from "@/app/_lib/util/datetime-util";

describe("DateTimeUtil", () => {
  it("should format to datetime-local correctly", () => {
    const isoString = "2026-02-09T22:58:05.016521Z";

    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const expected = `${year}-${month}-${day}T${hours}:${minutes}`;

    expect(DateTimeUtil.toDatetimeLocal(isoString)).toBe(expected);
  });

  it("should convert from datetime-local to ISO string correctly", () => {
    const datetimeLocal = "2026-02-09T19:58";

    const date = new Date(datetimeLocal);
    const expected = date.toISOString();

    expect(DateTimeUtil.fromDatetimeLocal(datetimeLocal)).toBe(expected);
  });

  it("should calculate difference in milliseconds correctly", () => {
    const start = "2026-02-09T19:58:00.000Z";
    const end = "2026-02-09T20:00:00.000Z";

    const expectedDiff = 2 * 60 * 1000; // 2 minutes in milliseconds

    expect(DateTimeUtil.diffMs(start, end)).toBe(expectedDiff);
  });

  it("should compare two ISO datetime strings correctly", () => {
    const isoString1 = "2026-02-09T19:58:00.000Z";
    const isoString2 = "2026-02-09T20:00:00.000Z";
    const isoString3 = "2026-02-09T19:58:00.000Z";

    expect(DateTimeUtil.isLessOrEqual(isoString1, isoString2)).toBe(true);
    expect(DateTimeUtil.isLessOrEqual(isoString1, isoString3)).toBe(true);
    expect(DateTimeUtil.isLessOrEqual(isoString2, isoString1)).toBe(false);
  });
});
