import { GuestDashboardSlice } from "@/app/_lib/store/slice/dashboard/GuestDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockGuestDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

describe("GuestDashboardSlice", () => {
  it("sets dashboard state, freezes leaderboard, and resets", () => {
    let state = GuestDashboardSlice.reducer(undefined, GuestDashboardSlice.actions.set(MockGuestDashboardResponseDTO()));
    state = GuestDashboardSlice.reducer(state, GuestDashboardSlice.actions.setLeaderboardIsFrozen(true));
    expect((state as typeof state & { listenerStatus: ListenerStatus }).listenerStatus).toBe(ListenerStatus.CONNECTED);
    expect(state.leaderboard.isFrozen).toBe(true);
    expect(GuestDashboardSlice.reducer(state, GuestDashboardSlice.actions.reset())).toEqual({});
  });
});
