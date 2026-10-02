import { ColorUtil } from "@/app/_lib/util/ColorUtil";

describe("ColorUtil", () => {
  it("generates six-digit hexadecimal colors", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    expect(ColorUtil.getRandom()).toBe("#888888");
  });

  it.each([
    ["#ffffff", "#000000"],
    ["#000000", "#FFFFFF"],
    ["#808080", "#FFFFFF"],
  ])("chooses a readable foreground for %s", (background, foreground) => {
    expect(ColorUtil.getForegroundColor(background)).toBe(foreground);
  });
});
