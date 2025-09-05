import { cls } from "@/lib/util/cls";

describe("cls", () => {
  it("should return class list without invalid values", () => {
    const result = cls(
      "valid-class",
      null,
      undefined,
      false,
      "",
      "another-valid-class",
    );
    expect(result).toEqual("valid-class another-valid-class");
  });
});
