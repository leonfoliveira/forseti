import { BallonType, balloonSlice } from "@/app/_store/slices/balloon-slice";

describe("balloonSlice", () => {
  it("should add a balloon", () => {
    const initialState = [] as BallonType[];
    const newState = balloonSlice.reducer(
      initialState,
      balloonSlice.actions.addBallon({ color: "#ffffff" }),
    );
    expect(newState).toHaveLength(1);
    expect(newState[0].color).toBe("#ffffff");
    expect(newState[0].id).toBeDefined();
  });

  it("should remove a balloon", () => {
    const initialState = [{ id: "1", color: "#ffffff" }] as BallonType[];
    const newState = balloonSlice.reducer(
      initialState,
      balloonSlice.actions.removeBallon({ id: "1" }),
    );
    expect(newState).toHaveLength(0);
  });
});
