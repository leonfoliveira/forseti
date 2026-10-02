import { EntityUtil } from "@/app/_lib/store/util/EntityUtil";

describe("EntityUtil", () => {
  const current = [
    { id: "same", version: 1, value: "old" },
    { id: "keep", version: 1, value: "kept" },
  ];

  it("adds missing entities and replaces existing entities only with a newer version", () => {
    expect(EntityUtil.merge(current, { id: "new", version: 1, value: "new" })).toHaveLength(3);
    expect(EntityUtil.merge(current, { id: "same", version: 2, value: "new" })[0].value).toBe("new");
    expect(EntityUtil.merge(current, { id: "same", version: 1, value: "stale" })).toBe(current);
    expect(EntityUtil.merge(undefined, { id: "first", version: 1, value: "first" })).toEqual([
      { id: "first", version: 1, value: "first" },
    ]);
  });

  it("merges batches without downgrading versions", () => {
    expect(EntityUtil.mergeBatch(current, [
      { id: "same", version: 2, value: "new" },
      { id: "keep", version: 0, value: "stale" },
      { id: "extra", version: 1, value: "extra" },
    ])).toEqual([
      { id: "same", version: 2, value: "new" },
      { id: "keep", version: 1, value: "kept" },
      { id: "extra", version: 1, value: "extra" },
    ]);
  });
});
