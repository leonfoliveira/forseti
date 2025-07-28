import { cls } from "@/app/_util/cls";

describe("cls utility function", () => {
  it("joins valid class names with a space", () => {
    const result = cls("class1", "class2", "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("filters out false, undefined, and null values", () => {
    const result = cls("class1", false, undefined, null, "class2");
    expect(result).toBe("class1 class2");
  });

  it("returns an empty string when all inputs are invalid", () => {
    const result = cls(false, undefined, null);
    expect(result).toBe("");
  });

  it("handles an empty input gracefully", () => {
    const result = cls();
    expect(result).toBe("");
  });

  it("ignores empty strings in the input", () => {
    const result = cls("class1", "", "class2");
    expect(result).toBe("class1 class2");
  });
});
