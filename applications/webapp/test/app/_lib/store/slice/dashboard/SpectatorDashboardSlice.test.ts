import { SpectatorDashboardSlice } from "@/app/_lib/store/slice/dashboard/SpectatorDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockSpectatorDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

describe("SpectatorDashboardSlice", () => {
  it("sets dashboard state, freezes leaderboard, and resets", () => {
    let state = SpectatorDashboardSlice.reducer(
      undefined,
      SpectatorDashboardSlice.actions.set(MockSpectatorDashboardResponseDTO()),
    );
    state = SpectatorDashboardSlice.reducer(
      state,
      SpectatorDashboardSlice.actions.setLeaderboardIsFrozen(true),
    );
    expect(
      (state as typeof state & { listenerStatus: ListenerStatus })
        .listenerStatus,
    ).toBe(ListenerStatus.CONNECTED);
    expect(state.leaderboard.isFrozen).toBe(true);
    expect(
      SpectatorDashboardSlice.reducer(
        state,
        SpectatorDashboardSlice.actions.reset(),
      ),
    ).toEqual({});
  });
});
