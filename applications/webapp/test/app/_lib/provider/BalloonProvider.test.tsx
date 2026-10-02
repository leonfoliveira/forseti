import { fireEvent, screen } from "@testing-library/react";

import { BalloonProvider } from "@/app/_lib/provider/BalloonProvider";
import { renderWithProviders } from "@/test/render-with-providers";

jest.mock("@/app/_lib/component/display/Balloon", () => ({
  Balloon: ({ color, onTopReached }: { color: string; onTopReached: () => void }) => (
    <button data-testid="balloon" style={{ color }} onClick={onTopReached}>Balloon</button>
  ),
}));

describe("BalloonProvider", () => {
  it("renders state balloons and removes each balloon on its completion callback", async () => {
    const { store } = await renderWithProviders(<BalloonProvider />, {
      balloon: [{ id: "balloon-1", color: "#ff0000" }],
    });
    expect(screen.getByTestId("balloon")).toHaveStyle({ color: "#ff0000" });
    fireEvent.click(screen.getByTestId("balloon"));
    expect(store.getState().balloon).toEqual([]);
  });
});
