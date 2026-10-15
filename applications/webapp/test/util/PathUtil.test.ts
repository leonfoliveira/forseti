import { PathUtil } from "@/app/_lib/util/PathUtil";

describe("PathUtil", () => {
  describe("isSamePath", () => {
    it("should return true for identical paths", () => {
      expect(
        PathUtil.isSamePath("/path/to/resource", "/path/to/resource"),
      ).toBe(true);
    });

    it("should return true for paths with trailing slashes", () => {
      expect(
        PathUtil.isSamePath("/path/to/resource/", "/path/to/resource"),
      ).toBe(true);
      expect(
        PathUtil.isSamePath("/path/to/resource", "/path/to/resource/"),
      ).toBe(true);
      expect(
        PathUtil.isSamePath("/path/to/resource/", "/path/to/resource/"),
      ).toBe(true);
    });

    it("should return false for different paths", () => {
      expect(PathUtil.isSamePath("/path/to/resource", "/path/to/other")).toBe(
        false,
      );
    });
  });
});
