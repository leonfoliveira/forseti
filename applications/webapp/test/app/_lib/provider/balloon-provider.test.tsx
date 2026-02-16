import { Balloon } from "@/app/_lib/component/display/balloon";
import { BalloonProvider } from "@/app/_lib/provider/balloon-provider";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/display/balloon", () => ({
  Balloon: jest.fn(),
}));

describe("BalloonProvider", () => {
  it("renders balloons from the store", async () => {
    await renderWithProviders(<BalloonProvider />, {
      balloonSlice: [
        { id: "1", color: "#ffffff" },
        { id: "2", color: "#000000" },
      ],
    });

    expect(Balloon).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "#ffffff",
        onTopReached: expect.any(Function),
      }),
      undefined,
    );

    expect(Balloon).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "#000000",
        onTopReached: expect.any(Function),
      }),
      undefined,
    );
  });
});
