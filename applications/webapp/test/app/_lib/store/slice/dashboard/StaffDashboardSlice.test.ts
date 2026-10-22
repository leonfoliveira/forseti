import {
  StaffDashboardState,
  StaffDashboardSlice,
} from "@/app/_lib/store/slice/dashboard/StaffDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockSubmissionWithCodeAndExecutionsResponseDTO } from "@/test/mock/response/MockDTOs";
import {
  MockStaffDashboardResponseDTO,
  MockContestWithMembersAndProblemsDTO,
  MockLeaderboardResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockAnnouncementResponseDTO,
  MockClarificationResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("StaffDashboardSlice", () => {
  const stateWithData: StaffDashboardState = MockStaffDashboardResponseDTO();

  it("should set the initial state correctly", () => {
    const state = StaffDashboardSlice.reducer(
      undefined,
      StaffDashboardSlice.actions.set(stateWithData),
    );
    expect(state).toEqual({
      ...stateWithData,
      listenerStatus: ListenerStatus.CONNECTED,
    });
  });

  it("should reset the state", () => {
    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.reset(),
    );

    expect(state).toEqual({});
  });

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a partial leaderboard", () => {
    const leaderboardCell = MockLeaderboardCellResponseDTO({
      memberId: stateWithData.leaderboard.rows[0].memberId,
      problemId: stateWithData.leaderboard.rows[0].cells[0].problemId,
      isAccepted: !stateWithData.leaderboard.rows[0].cells[0].isAccepted,
    });

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.mergeLeaderboard(leaderboardCell),
    );

    expect(state.leaderboard.rows[0].cells[0].isAccepted).toBe(
      leaderboardCell.isAccepted,
    );
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionWithCodeAndExecutionsResponseDTO();

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.announcements).toHaveLength(2);
    expect(state.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new clarification", () => {
    const mockClarification = MockClarificationResponseDTO();

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.clarifications).toHaveLength(2);
    expect(state.clarifications).toContainEqual(mockClarification);
  });

  it("should freeze the contest", () => {
    const mockContest = MockContestWithMembersAndProblemsDTO();

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.freeze(mockContest),
    );

    expect(state.contest).toEqual(mockContest);
  });

  it("should unfreeze the contest", () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const leaderboard = MockLeaderboardResponseDTO();
    const submissions = [MockSubmissionWithCodeAndExecutionsResponseDTO()];

    const state = StaffDashboardSlice.reducer(
      stateWithData,
      StaffDashboardSlice.actions.unfreeze({
        contest,
        leaderboard,
        submissions,
      }),
    );

    expect(state.contest).toEqual(contest);
    expect(state.leaderboard).toEqual(leaderboard);
    expect(state.submissions).toEqual(expect.arrayContaining(submissions));
  });
});
