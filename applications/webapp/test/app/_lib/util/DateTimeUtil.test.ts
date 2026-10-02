import { DateTimeUtil } from "@/app/_lib/util/DateTimeUtil";

describe("DateTimeUtil", () => {
  it("converts ISO timestamps to datetime-local values and back", () => {
    const localDate = new Date("2026-02-09T22:58:05.016Z");
    const expected = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}T${String(localDate.getHours()).padStart(2, "0")}:${String(localDate.getMinutes()).padStart(2, "0")}`;
    expect(DateTimeUtil.toDatetimeLocal("2026-02-09T22:58:05.016Z")).toBe(expected);
    expect(DateTimeUtil.fromDatetimeLocal("2026-02-09T22:58")).toBe(
      new Date("2026-02-09T22:58").toISOString(),
    );
  });

  it("compares and subtracts timestamp values", () => {
    expect(DateTimeUtil.diffMs("2026-01-01T00:00:00Z", "2026-01-01T00:01:00Z")).toBe(60_000);
    expect(DateTimeUtil.isLessOrEqual("2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z")).toBe(true);
  });
});
