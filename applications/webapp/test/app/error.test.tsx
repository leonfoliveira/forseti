import ServerErrorPage from "@/app/error";

describe("ServerErrorPage", () => {
  it("should be defined and be a function", () => {
    expect(ServerErrorPage).toBeDefined();
    expect(typeof ServerErrorPage).toBe("function");
  });
});
