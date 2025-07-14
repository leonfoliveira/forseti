import { cls } from "@/app/_util/cls";

describe("cls", () => {
  it("should join class names", () => {
    expect(cls("class1", "class2")).toBe("class1 class2");
  });

  it("should remove falsy values", () => {
    expect(cls("class1", false, "class2", undefined, null)).toBe(
      "class1 class2",
    );
  });

  it("should handle empty strings", () => {
    expect(cls("class1", "", "class2")).toBe("class1 class2");
  });

  it("should return an empty string if no valid classes are provided", () => {
    expect(cls(false, undefined, null)).toBe("");
  });
});
