import {
  ContestantDashboardState,
  ContestantDashboardSlice,
} from "@/app/_lib/store/slice/dashboard/ContestantDashboardSlice";
import { ListenerStatus } from "@/domain/enumerate/ListenerStatus";
import { MockSubmissionResponseDTO } from "@/test/mock/response/MockDTOs";
import {
  MockContestantDashboardResponseDTO,
  MockContestWithMembersAndProblemsDTO,
  MockLeaderboardResponseDTO,
  MockLeaderboardCellResponseDTO,
  MockAnnouncementResponseDTO,
  MockClarificationResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("ContestantDashboardSlice", () => {
  const stateWithData: ContestantDashboardState = {
    ...MockContestantDashboardResponseDTO(),
  };

  it("should set the initial state correctly", () => {
    const state = ContestantDashboardSlice.reducer(
      undefined,
      ContestantDashboardSlice.actions.set(stateWithData),
    );
    expect(state).toEqual({
      ...stateWithData,
      listenerStatus: ListenerStatus.CONNECTED,
    });
  });

  it("should reset the state", () => {
    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.reset(),
    );

    expect(state).toEqual({});
  });

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a partial leaderboard", () => {
    const leaderboardCell = MockLeaderboardCellResponseDTO({
      memberId: stateWithData.leaderboard.rows[0].memberId,
      problemId: stateWithData.leaderboard.rows[0].cells[0].problemId,
      isAccepted: !stateWithData.leaderboard.rows[0].cells[0].isAccepted,
    });

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.mergeLeaderboard(leaderboardCell),
    );

    expect(state.leaderboard.rows[0].cells[0].isAccepted).toBe(
      leaderboardCell.isAccepted,
    );
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionResponseDTO();

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.announcements).toHaveLength(2);
    expect(state.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new clarification", () => {
    const mockClarification = MockClarificationResponseDTO();

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.clarifications).toHaveLength(2);
    expect(state.clarifications).toContainEqual(mockClarification);
  });

  it("should freeze the contest", () => {
    const mockContest = MockContestWithMembersAndProblemsDTO();

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.freeze(mockContest),
    );

    expect(state.contest).toEqual(mockContest);
  });

  it("should unfreeze the contest", () => {
    const contest = MockContestWithMembersAndProblemsDTO();
    const leaderboard = MockLeaderboardResponseDTO();
    const submissions = [MockSubmissionResponseDTO()];

    const state = ContestantDashboardSlice.reducer(
      stateWithData,
      ContestantDashboardSlice.actions.unfreeze({
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
