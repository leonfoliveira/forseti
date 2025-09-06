import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { judgeDashboardSlice } from "@/store/slices/judge-dashboard-slice";
import { MockAnnouncementResponseDTO } from "@/test/mock/response/announcement/MockAnnouncementResponseDTO";
import { MockClarificationResponseDTO } from "@/test/mock/response/clarification/MockClarificationResponseDTO";
import { MockContestPublicResponseDTO } from "@/test/mock/response/contest/MockContestPublicResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";
import { MockSubmissionFullResponseDTO } from "@/test/mock/response/submission/MockSubmissionFullResponseDTO";

describe("judgeDashboardSlice", () => {
  const stateWithData = {
    contest: MockContestPublicResponseDTO(),
    leaderboard: MockLeaderboardResponseDTO(),
    submissions: [MockSubmissionFullResponseDTO()],
  } as any;

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionFullResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionFullResponseDTO = {
      ...stateWithData.submissions[0],
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
    };

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.contest.announcements).toHaveLength(2);
    expect(state.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(2);
    expect(state.contest.clarifications).toContainEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: stateWithData.contest.clarifications[0]?.id,
    });

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0].children).toHaveLength(1);
    expect(state.contest.clarifications[0].children[0]).toEqual(
      mockClarification,
    );
  });

  it("should delete a clarification by id", () => {
    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.deleteClarification(
        stateWithData.contest.clarifications[0].id,
      ),
    );

    expect(state.contest.clarifications).toHaveLength(0);
  });
});
