import { BalloonSlice } from "@/app/_lib/store/slice/BalloonSlice";

describe("BalloonSlice", () => {
  it("adds balloons with IDs and removes the selected balloon", () => {
    const first = BalloonSlice.reducer(undefined, BalloonSlice.actions.addBalloon({ color: "#ff0000" }));
    const both = BalloonSlice.reducer(first, BalloonSlice.actions.addBalloon({ color: "#00ff00" }));
    expect(both).toHaveLength(2);
    expect(both[0].id).toBeTruthy();
    expect(both[1].id).not.toBe(both[0].id);
    expect(BalloonSlice.reducer(both, BalloonSlice.actions.removeBalloon({ id: both[0].id }))).toEqual([both[1]]);
  });
});
