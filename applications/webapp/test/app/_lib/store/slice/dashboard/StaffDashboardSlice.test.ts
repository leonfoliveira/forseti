import { StaffDashboardSlice } from "@/app/_lib/store/slice/dashboard/StaffDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import {
  MockStaffDashboardResponseDTO,
  MockSubmissionWithCodeResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("StaffDashboardSlice", () => {
  it("sets data, freezes leaderboard, merges submissions and resets", () => {
    let state = StaffDashboardSlice.reducer(
      undefined,
      StaffDashboardSlice.actions.set(MockStaffDashboardResponseDTO()),
    );
    state = StaffDashboardSlice.reducer(
      state,
      StaffDashboardSlice.actions.setLeaderboardIsFrozen(true),
    );
    state = StaffDashboardSlice.reducer(
      state,
      StaffDashboardSlice.actions.mergeSubmissionBatch([
        MockSubmissionWithCodeResponseDTO({ id: "submission-2" }),
      ]),
    );
    expect(
      (state as typeof state & { listenerStatus: ListenerStatus })
        .listenerStatus,
    ).toBe(ListenerStatus.CONNECTED);
    expect(state.leaderboard.isFrozen).toBe(true);
    expect(state.submissions.map(({ id }) => id)).toContain("submission-2");
    expect(
      StaffDashboardSlice.reducer(state, StaffDashboardSlice.actions.reset()),
    ).toEqual({});
  });
});
