import { guestDashboardSlice } from "@/app/_store/slices/guest-dashboard-slice";
import { ListenerStatus } from "@/core/domain/enumerate/ListenerStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardPartialResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardPartialResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionPublicResponseDTO } from "@/test/mock/response/submission/MockSubmissionPublicResponseDTO";

describe("guestDashboardSlice", () => {
  const stateWithData = {
    contest: MockContestPublicResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    submissions: [MockSubmissionPublicResponseDTO()],
  } as any;

  it("should have the correct initial state", () => {
    const state = guestDashboardSlice.reducer(undefined, {
      type: "@@INIT",
    });
    expect(state).toEqual({ listenerStatus: ListenerStatus.DISCONNECTED });
  });

  it("should set initial state", () => {
    const state = guestDashboardSlice.reducer(
      undefined,
      guestDashboardSlice.actions.set(stateWithData),
    );

    expect(state).toEqual({
      ...stateWithData,
      listenerStatus: ListenerStatus.CONNECTED,
    });
  });

  it("should set the listener status", () => {
    const state = guestDashboardSlice.reducer(
      undefined,
      guestDashboardSlice.actions.setListenerStatus(
        ListenerStatus.LOST_CONNECTION,
      ),
    );
    expect(state.listenerStatus).toBe(ListenerStatus.LOST_CONNECTION);
  });

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a partial leaderboard", () => {
    const partialLeaderboard = MockLeaderboardPartialResponseDTO({
      memberId: stateWithData.leaderboard.members[0].id,
      problemId: stateWithData.leaderboard.members[0].problems[0].id,
      isAccepted: !stateWithData.leaderboard.members[0].problems[0].isAccepted,
    });

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeLeaderboard(partialLeaderboard),
    );

    expect(state.leaderboard.members[0].problems[0].isAccepted).toBe(
      partialLeaderboard.isAccepted,
    );
  });

  it("should set the leaderboard as frozen", () => {
    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.setLeaderboardIsFrozen(true),
    );

    expect(state.leaderboard.isFrozen).toBe(true);
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionPublicResponseDTO();

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionPublicResponseDTO = {
      ...stateWithData.submissions[0],
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
      version: 2,
    };

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a batch of submissions", () => {
    const newSubmissions = [
      MockSubmissionPublicResponseDTO(),
      MockSubmissionPublicResponseDTO(),
    ];

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeSubmissionBatch(newSubmissions),
    );

    expect(state.submissions).toHaveLength(3);
    expect(state.submissions).toEqual(
      expect.arrayContaining([...stateWithData.submissions, ...newSubmissions]),
    );
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.contest.announcements).toHaveLength(2);
    expect(state.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(2);
    expect(state.contest.clarifications).toContainEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: stateWithData.contest.clarifications[0]?.id,
    });

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0].children).toHaveLength(1);
    expect(state.contest.clarifications[0].children[0]).toEqual(
      mockClarification,
    );
  });

  it("should delete a clarification by id", () => {
    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.deleteClarification(
        stateWithData.contest.clarifications[0].id,
      ),
    );

    expect(state.contest.clarifications).toHaveLength(0);
  });
});
