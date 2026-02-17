import { adminDashboardSlice } from "@/app/_store/slices/admin-dashboard-slice";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestFullResponseDTO } from "@/test/mock/response/contest/MockContestFullResponseDTO";
import { MockLeaderboardPartialResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardPartialResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionFullWithExecutionResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullWithExecutionResponseDTO";

describe("adminDashboardSlice", () => {
  const stateWithData = {
    contest: MockContestFullResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    submissions: [MockSubmissionFullWithExecutionResponseDTO()],
  } as any;

  it("should have the correct initial state", () => {
    const state = adminDashboardSlice.reducer(undefined, {
      type: "@@INIT",
    });
    expect(state).toEqual({ listenerStatus: ListenerStatus.DISCONNECTED });
  });

  it("should set initial state", () => {
    const state = adminDashboardSlice.reducer(
      undefined,
      adminDashboardSlice.actions.set(stateWithData),
    );

    expect(state).toEqual({
      ...stateWithData,
      listenerStatus: ListenerStatus.CONNECTED,
    });
  });

  it("should set the listener status", () => {
    const state = adminDashboardSlice.reducer(
      undefined,
      adminDashboardSlice.actions.setListenerStatus(
        ListenerStatus.LOST_CONNECTION,
      ),
    );
    expect(state.listenerStatus).toBe(ListenerStatus.LOST_CONNECTION);
  });

  it("should set the contest", () => {
    const newContest = MockContestFullResponseDTO();

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.setContest(newContest),
    );

    expect(state.contest).toEqual(newContest);
  });

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a partial leaderboard", () => {
    const partialLeaderboard = MockLeaderboardPartialResponseDTO({
      memberId: stateWithData.leaderboard.members[0].id,
      problemId: stateWithData.leaderboard.members[0].problems[0].id,
      isAccepted: !stateWithData.leaderboard.members[0].problems[0].isAccepted,
    });

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeLeaderboard(partialLeaderboard),
    );

    expect(state.leaderboard.members[0].problems[0].isAccepted).toBe(
      partialLeaderboard.isAccepted,
    );
  });

  it("should set the leaderboard as frozen", () => {
    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.setLeaderboardIsFrozen(true),
    );

    expect(state.leaderboard.isFrozen).toBe(true);
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionFullWithExecutionResponseDTO();

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionFullWithExecutionResponseDTO = {
      ...stateWithData.submissions[0],
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
      version: 2,
    };

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.contest.announcements).toHaveLength(2);
    expect(state.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(2);
    expect(state.contest.clarifications).toContainEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: stateWithData.contest.clarifications[0]?.id,
    });

    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0].children).toHaveLength(1);
    expect(state.contest.clarifications[0].children[0]).toEqual(
      mockClarification,
    );
  });

  it("should delete a clarification by id", () => {
    const state = adminDashboardSlice.reducer(
      stateWithData,
      adminDashboardSlice.actions.deleteClarification(
        stateWithData.contest.clarifications[0].id,
      ),
    );

    expect(state.contest.clarifications).toHaveLength(0);
  });
});
