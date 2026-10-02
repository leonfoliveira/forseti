import { ObjectUtil } from "@/util/ObjectUtil";

describe("ObjectUtil", () => {
  it("returns a shallow copy without the requested keys", () => {
    const original = { id: "item-1", name: "Ada", enabled: true };

    const result = ObjectUtil.removeKeys(original, "id", "enabled");

    expect(result).toEqual({ name: "Ada" });
    expect(result).not.toBe(original);
    expect(original).toEqual({ id: "item-1", name: "Ada", enabled: true });
  });

  it("returns a copy when no keys are supplied", () => {
    const original = { name: "Ada" };

    const result = ObjectUtil.removeKeys(original);

    expect(result).toEqual(original);
    expect(result).not.toBe(original);
  });
});
