import { makeStore } from "@/store/store";

jest.unmock("@/store/store");

describe("makeStore", () => {
  it("should initialize state for all slices", () => {
    const store = makeStore();
    const state = store.getState();
    expect(state).toHaveProperty("authorization");
    expect(state).toHaveProperty("contestMetadata");
    expect(state).toHaveProperty("contestantDashboard");
    expect(state).toHaveProperty("guestDashboard");
    expect(state).toHaveProperty("judgeDashboard");
    expect(state).toHaveProperty("adminDashboard");
  });
});
