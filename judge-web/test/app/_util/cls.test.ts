import { cls } from "@/app/_util/cls";

describe("cls", () => {
  it("returns a single class when only one valid class is provided", () => {
    expect(cls("class1")).toBe("class1");
  });

  it("joins multiple valid classes with a space", () => {
    expect(cls("class1", "class2", "class3")).toBe("class1 class2 class3");
  });

  it("filters out false, undefined, null, and empty strings", () => {
    expect(cls("class1", false, undefined, null, "", "class2")).toBe(
      "class1 class2",
    );
  });

  it("returns an empty string when no valid classes are provided", () => {
    expect(cls(false, undefined, null, "")).toBe("");
  });

  it("handles a mix of valid and invalid classes", () => {
    expect(cls("class1", null, "class2", undefined, "class3", false)).toBe(
      "class1 class2 class3",
    );
  });
});
