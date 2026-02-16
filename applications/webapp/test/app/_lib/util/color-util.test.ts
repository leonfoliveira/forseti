import { ColorUtil } from "@/app/_lib/util/color-util";

describe("ColorUtil", () => {
  describe("getRandom", () => {
    it("should return a valid hex color code", () => {
      const color = ColorUtil.getRandom();
      expect(color).toMatch(/^#[A-Fa-f0-9]{6}$/);
    });
  });

  describe("getForegroundColor", () => {
    it("should return black for light background colors", () => {
      expect(ColorUtil.getForegroundColor("#ffffff")).toBe("#000000");
      expect(ColorUtil.getForegroundColor("#ffcccc")).toBe("#000000");
    });

    it("should return white for dark background colors", () => {
      expect(ColorUtil.getForegroundColor("#000000")).toBe("#FFFFFF");
      expect(ColorUtil.getForegroundColor("#333333")).toBe("#FFFFFF");
    });
  });
});
