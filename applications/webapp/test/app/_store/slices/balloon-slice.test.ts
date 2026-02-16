import { BalloonType, balloonSlice } from "@/app/_store/slices/balloon-slice";

describe("balloonSlice", () => {
  it("should add a balloon", () => {
    const initialState = [] as BalloonType[];
    const newState = balloonSlice.reducer(
      initialState,
      balloonSlice.actions.addBalloon({ color: "#ffffff" }),
    );
    expect(newState).toHaveLength(1);
    expect(newState[0].color).toBe("#ffffff");
    expect(newState[0].id).toBeDefined();
  });

  it("should remove a balloon", () => {
    const initialState = [{ id: "1", color: "#ffffff" }] as BalloonType[];
    const newState = balloonSlice.reducer(
      initialState,
      balloonSlice.actions.removeBalloon({ id: "1" }),
    );
    expect(newState).toHaveLength(0);
  });
});
