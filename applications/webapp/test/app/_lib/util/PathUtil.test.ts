import { PathUtil } from "@/app/_lib/util/PathUtil";

describe("PathUtil", () => {
  it("should correctly handle path operations", () => {
    expect(
      PathUtil.isSamePath("/home/leonfoliveira", "/home/leonfoliveira"),
    ).toBe(true);
    expect(
      PathUtil.isSamePath("/home/leonfoliveira/", "/home/leonfoliveira"),
    ).toBe(true);
    expect(
      PathUtil.isSamePath("/home/leonfoliveira", "/home/leonfoliveira/"),
    ).toBe(true);
    expect(
      PathUtil.isSamePath("/home/leonfoliveira/", "/home/leonfoliveira/"),
    ).toBe(true);
    expect(
      PathUtil.isSamePath("/home/leonfoliveira", "/home/leonfoliveira/extra"),
    ).toBe(false);
    expect(
      PathUtil.isSamePath("/home/leonfoliveira/extra", "/home/leonfoliveira"),
    ).toBe(false);
  });
});
