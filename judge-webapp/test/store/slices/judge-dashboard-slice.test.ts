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
  const initialState = {
    isLoading: true,
    error: null,
    data: null as any,
  };

  const stateWithData = {
    isLoading: false,
    error: null,
    data: {
      contest: MockContestPublicResponseDTO(),
      leaderboard: MockLeaderboardResponseDTO(),
      submissions: [MockSubmissionFullResponseDTO()],
    } as any,
  };

  it("should have the correct initial state", () => {
    const state = judgeDashboardSlice.reducer(undefined, {
      type: "@@INIT",
    });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
    expect(state.data).toBe(null);
  });

  it("should set loading to false and store data on success", () => {
    const dashboardData = {
      contest: MockContestPublicResponseDTO(),
      leaderboard: MockLeaderboardResponseDTO(),
      submissions: [MockSubmissionFullResponseDTO()],
    };

    const state = judgeDashboardSlice.reducer(
      initialState,
      judgeDashboardSlice.actions.success(dashboardData),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data).toEqual(dashboardData);
  });

  it("should set error and clear data on fail", () => {
    const error = new Error("Failed to load dashboard");
    const state = judgeDashboardSlice.reducer(
      initialState,
      judgeDashboardSlice.actions.fail(error),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error.name);
    expect(state.data).toBe(null);
  });

  it("should set the leaderboard", () => {
    const newLeaderboard = MockLeaderboardResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.data!.leaderboard).toEqual(newLeaderboard);
  });

  it("should merge a new submission", () => {
    const newSubmission = MockSubmissionFullResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.data!.submissions).toHaveLength(2);
    expect(state.data!.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionFullResponseDTO = {
      ...stateWithData.data!.submissions[0],
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
    };

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.data!.submissions).toHaveLength(1);
    expect(state.data!.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a new announcement", () => {
    const newAnnouncement = MockAnnouncementResponseDTO();

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.data!.contest.announcements).toHaveLength(2);
    expect(state.data!.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: undefined,
    });

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.data!.contest.clarifications).toHaveLength(2);
    expect(state.data!.contest.clarifications).toContainEqual(
      mockClarification,
    );
  });

  it("should merge a child clarification to the correct parent", () => {
    const mockClarification = MockClarificationResponseDTO({
      parentId: stateWithData.data!.contest.clarifications[0]?.id,
    });

    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.data!.contest.clarifications).toHaveLength(1);
    expect(state.data!.contest.clarifications[0].children).toHaveLength(1);
    expect(state.data!.contest.clarifications[0].children[0]).toEqual(
      mockClarification,
    );
  });

  it("should delete a clarification by id", () => {
    const state = judgeDashboardSlice.reducer(
      stateWithData,
      judgeDashboardSlice.actions.deleteClarification(
        stateWithData.data!.contest.clarifications[0].id,
      ),
    );

    expect(state.data!.contest.clarifications).toHaveLength(0);
  });
});
