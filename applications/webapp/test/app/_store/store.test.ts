import { makeStore } from "@/app/_store/store";

jest.unmock("@/app/_store/store");

describe("makeStore", () => {
  it("should initialize state for all slices", () => {
    const store = makeStore();
    const state = store.getState();
    expect(state).toHaveProperty("balloon");
    expect(state).toHaveProperty("session");
    expect(state).toHaveProperty("contestMetadata");
    expect(state).toHaveProperty("contestantDashboard");
    expect(state).toHaveProperty("guestDashboard");
    expect(state).toHaveProperty("judgeDashboard");
    expect(state).toHaveProperty("adminDashboard");
    expect(state).toHaveProperty("staffDashboard");
  });
});
