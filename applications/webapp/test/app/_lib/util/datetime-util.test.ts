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
});
