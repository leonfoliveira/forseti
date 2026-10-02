import { AdminDashboardSlice } from "@/app/_lib/store/slice/dashboard/AdminDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockAdminDashboardResponseDTO, MockSubmissionWithCodeResponseDTO } from "@/test/mock/response/MockDTOs";

describe("AdminDashboardSlice", () => {
  it("sets and resets dashboard state", () => {
    const state = AdminDashboardSlice.reducer(undefined, AdminDashboardSlice.actions.set(MockAdminDashboardResponseDTO()));
    expect((state as typeof state & { listenerStatus: ListenerStatus }).listenerStatus).toBe(ListenerStatus.CONNECTED);
    expect(AdminDashboardSlice.reducer(state, AdminDashboardSlice.actions.reset())).toEqual({});
  });

  it("updates the contest and merges newer submissions", () => {
    let state = AdminDashboardSlice.reducer(undefined, AdminDashboardSlice.actions.set(MockAdminDashboardResponseDTO()));
    state = AdminDashboardSlice.reducer(state, AdminDashboardSlice.actions.mergeSubmission(MockSubmissionWithCodeResponseDTO({ version: 2 })));
    expect(state.submissions[0].version).toBe(2);
    expect(state.contest.title).toBe("Test contest");
  });
});
