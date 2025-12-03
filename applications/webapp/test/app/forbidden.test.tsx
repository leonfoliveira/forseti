import ForbiddenPage from "@/app/forbidden";

describe("ForbiddenPage", () => {
  it("should be defined and be a function", () => {
    expect(ForbiddenPage).toBeDefined();
    expect(typeof ForbiddenPage).toBe("function");
  });
});
