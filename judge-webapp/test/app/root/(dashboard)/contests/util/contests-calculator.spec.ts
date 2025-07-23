import { recalculateContests } from "@/app/root/(dashboard)/contests/_util/contests-calculator";

describe("recalculateContests", () => {
  it("should update the contest if it exists and sort by startAt", () => {
    const contests = [
      { id: "1", startAt: "2023-01-01T00:00:00Z" },
      { id: "2", startAt: "2023-02-01T00:00:00Z" },
    ] as any;
    const newContest = { id: "1", startAt: "2023-03-01T00:00:00Z" } as any;

    const result = recalculateContests(contests, newContest);

    expect(result).toEqual([
      { id: "1", startAt: "2023-03-01T00:00:00Z" },
      { id: "2", startAt: "2023-02-01T00:00:00Z" },
    ]);
  });
});
