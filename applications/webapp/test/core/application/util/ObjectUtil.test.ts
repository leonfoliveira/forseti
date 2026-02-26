import { ObjectUtil } from "@/core/application/util/ObjectUtil";

describe("ObjectUtil", () => {
  describe("removeKeys", () => {
    it("should remove specified keys from the object", () => {
      const original = { a: 1, b: 2, c: 3 };
      const result = ObjectUtil.removeKeys(original, "b", "c");
      expect(result).toEqual({ a: 1 });
    });

    it("should return a new object without modifying the original", () => {
      const original = { a: 1, b: 2, c: 3 };
      const result = ObjectUtil.removeKeys(original, "b");
      expect(result).toEqual({ a: 1, c: 3 });
      expect(original).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should handle non-existent keys gracefully", () => {
      const original = { a: 1, b: 2 };
      const result = ObjectUtil.removeKeys(original, "c" as any);
      expect(result).toEqual({ a: 1, b: 2 });
    });
  });
});
