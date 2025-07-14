import { formatDifference, toDateInputFormat } from "@/app/_util/date-utils";

describe("date-utils", () => {
  it("formatDifference", () => {
    const diff = 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 + 1000 * 60 + 1000; // 2 days, 1 hour, 1 minute, and 1 second
    expect(formatDifference(diff)).toBe("2d 01:01:01");

    const diff2 = -1000; // negative difference
    expect(formatDifference(diff2)).toBe("0d 00:00:00");

    const diff3 = 0; // zero difference
    expect(formatDifference(diff3)).toBe("0d 00:00:00");

    const diff4 = 1000 * 60 * 60 * 24 * 365; // one year
    expect(formatDifference(diff4)).toBe("365d 00:00:00");
  });

  it("toDateInputFormat", () => {
    const date = new Date("2023-10-01T12:30:00");
    expect(toDateInputFormat(date)).toBe("2023-10-01T12:30");

    const date2 = new Date("2020-01-05T08:15:00");
    expect(toDateInputFormat(date2)).toBe("2020-01-05T08:15");

    const date3 = new Date("1999-12-31T23:59:59");
    expect(toDateInputFormat(date3)).toBe("1999-12-31T23:59");
  });
});
