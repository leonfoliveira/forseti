import { JudgeDashboardSlice } from "@/app/_lib/store/slice/dashboard/JudgeDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockJudgeDashboardResponseDTO } from "@/test/mock/response/MockDTOs";

describe("JudgeDashboardSlice", () => {
  it("sets dashboard state, freezes leaderboard, and resets", () => {
    let state = JudgeDashboardSlice.reducer(undefined, JudgeDashboardSlice.actions.set(MockJudgeDashboardResponseDTO()));
    state = JudgeDashboardSlice.reducer(state, JudgeDashboardSlice.actions.setLeaderboardIsFrozen(true));
    expect((state as typeof state & { listenerStatus: ListenerStatus }).listenerStatus).toBe(ListenerStatus.CONNECTED);
    expect(state.leaderboard.isFrozen).toBe(true);
    expect(JudgeDashboardSlice.reducer(state, JudgeDashboardSlice.actions.reset())).toEqual({});
  });
});
