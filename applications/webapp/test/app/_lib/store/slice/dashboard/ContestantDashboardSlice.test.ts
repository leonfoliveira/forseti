import { ContestantDashboardSlice } from "@/app/_lib/store/slice/dashboard/ContestantDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockContestantDashboardResponseDTO, MockSubmissionResponseDTO } from "@/test/mock/response/MockDTOs";

describe("ContestantDashboardSlice", () => {
  it("sets data, freezes leaderboard, merges submissions and resets", () => {
    let state = ContestantDashboardSlice.reducer(undefined, ContestantDashboardSlice.actions.set(MockContestantDashboardResponseDTO()));
    state = ContestantDashboardSlice.reducer(state, ContestantDashboardSlice.actions.setLeaderboardIsFrozen(true));
    state = ContestantDashboardSlice.reducer(state, ContestantDashboardSlice.actions.mergeSubmissionBatch([
      MockSubmissionResponseDTO({ id: "submission-2" }),
    ]));
    expect((state as typeof state & { listenerStatus: ListenerStatus }).listenerStatus).toBe(ListenerStatus.CONNECTED);
    expect(state.leaderboard.isFrozen).toBe(true);
    expect(state.submissions.map(({ id }) => id)).toContain("submission-2");
    expect(ContestantDashboardSlice.reducer(state, ContestantDashboardSlice.actions.reset())).toEqual({});
  });
});
