import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { guestDashboardSlice } from "@/store/slices/guest-dashboard-slice";

describe("guestDashboardSlice", () => {
  const mockContest: ContestPublicResponseDTO = {
    id: "contest-1",
    slug: "test-contest",
    title: "Test Contest",
    languages: [Language.JAVA_21, Language.PYTHON_3_13],
    startAt: "2023-01-01T10:00:00Z",
    endAt: "2023-01-01T15:00:00Z",
    announcements: [],
    clarifications: [],
    problems: [],
    members: [],
  };

  const mockLeaderboard: ContestLeaderboardResponseDTO = {
    contestId: "contest-1",
    slug: "test-contest",
    startAt: "2023-01-01T10:00:00Z",
    issuedAt: "2023-01-01T12:00:00Z",
    classification: [
      {
        memberId: "member-1",
        name: "Test Member",
        score: 1,
        penalty: 300,
        problems: [],
      },
    ],
  };

  const mockSubmission: SubmissionPublicResponseDTO = {
    id: "submission-1",
    problem: {
      id: "problem-1",
      letter: "A",
      title: "Problem A",
      description: {
        id: "desc-1",
        filename: "description.pdf",
        contentType: "application/pdf",
      },
    },
    member: {
      id: "member-1",
      name: "Test Member",
      type: "CONTESTANT" as any,
    },
    language: Language.JAVA_21,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.ACCEPTED,
    createdAt: "2023-01-01T11:00:00Z",
  };

  const mockAnnouncement: AnnouncementResponseDTO = {
    id: "announcement-1",
    createdAt: "2023-01-01T12:00:00Z",
    member: {
      id: "judge-1",
      name: "Judge",
      type: "JUDGE" as any,
    },
    text: "Test announcement",
  };

  const mockClarification: ClarificationResponseDTO = {
    id: "clarification-1",
    createdAt: "2023-01-01T12:30:00Z",
    member: {
      id: "member-1",
      name: "Test Member",
      type: "CONTESTANT" as any,
    },
    problem: {
      id: "problem-1",
      letter: "A",
      title: "Problem A",
      description: {
        id: "desc-1",
        filename: "description.pdf",
        contentType: "application/pdf",
      },
    },
    text: "Test clarification",
    children: [],
  };

  const mockChildClarification: ClarificationResponseDTO = {
    id: "clarification-2",
    createdAt: "2023-01-01T12:45:00Z",
    member: {
      id: "judge-1",
      name: "Judge",
      type: "JUDGE" as any,
    },
    parentId: "clarification-1",
    text: "Response to clarification",
    children: [],
  };

  const initialState = {
    isLoading: true as const,
    error: null,
    data: null,
  };

  const stateWithData = {
    isLoading: false as const,
    error: null,
    data: {
      contest: mockContest,
      leaderboard: mockLeaderboard,
      submissions: [mockSubmission],
    },
  };

  it("should have the correct initial state", () => {
    const state = guestDashboardSlice.reducer(undefined, { type: "@@INIT" });
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe(null);
    expect(state.data).toBe(null);
  });

  it("should set loading to false and store data on success", () => {
    const dashboardData = {
      contest: mockContest,
      leaderboard: mockLeaderboard,
      submissions: [mockSubmission],
    };

    const state = guestDashboardSlice.reducer(
      initialState,
      guestDashboardSlice.actions.success(dashboardData),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.data).toEqual(dashboardData);
  });

  it("should set error and clear data on fail", () => {
    const error = new Error("Failed to load dashboard");

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.fail(error),
    );

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(error);
    expect(state.data).toBe(null);
  });

  it("should set the leaderboard", () => {
    const newLeaderboard: ContestLeaderboardResponseDTO = {
      ...mockLeaderboard,
      classification: [
        {
          memberId: "member-2",
          name: "Another Member",
          score: 2,
          penalty: 250,
          problems: [],
        },
      ],
    };

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.data!.leaderboard).toEqual(newLeaderboard);
    expect(state.data!.contest).toEqual(mockContest);
    expect(state.data!.submissions).toEqual([mockSubmission]);
  });

  it("should merge a new submission", () => {
    const newSubmission: SubmissionPublicResponseDTO = {
      id: "submission-2",
      problem: mockSubmission.problem,
      member: mockSubmission.member,
      language: Language.PYTHON_3_13,
      status: SubmissionStatus.JUDGING,
      answer: SubmissionAnswer.NO_ANSWER,
      createdAt: "2023-01-01T11:15:00Z",
    };

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.data!.submissions).toHaveLength(2);
    expect(state.data!.submissions).toContainEqual(mockSubmission);
    expect(state.data!.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionPublicResponseDTO = {
      ...mockSubmission,
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
    };

    const state = guestDashboardSlice.reducer(
      stateWithData,
      guestDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.data!.submissions).toHaveLength(1);
    expect(state.data!.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a new announcement", () => {
    const stateWithAnnouncement = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          announcements: [mockAnnouncement],
        },
      },
    };

    const newAnnouncement: AnnouncementResponseDTO = {
      id: "announcement-2",
      createdAt: "2023-01-01T13:00:00Z",
      member: mockAnnouncement.member,
      text: "Another announcement",
    };

    const state = guestDashboardSlice.reducer(
      stateWithAnnouncement,
      guestDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.data!.contest.announcements).toHaveLength(2);
    expect(state.data!.contest.announcements).toContainEqual(mockAnnouncement);
    expect(state.data!.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const stateWithEmptyClarifications = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          clarifications: [],
        },
      },
    };

    const state = guestDashboardSlice.reducer(
      stateWithEmptyClarifications,
      guestDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.data!.contest.clarifications).toHaveLength(1);
    expect(state.data!.contest.clarifications[0]).toEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const stateWithClarification = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          clarifications: [mockClarification],
        },
      },
    };

    const state = guestDashboardSlice.reducer(
      stateWithClarification,
      guestDashboardSlice.actions.mergeClarification(mockChildClarification),
    );

    expect(state.data!.contest.clarifications).toHaveLength(2);
    expect(state.data!.contest.clarifications[0].children).toHaveLength(1);
    expect(state.data!.contest.clarifications[0].children[0]).toEqual(
      mockChildClarification,
    );
  });

  it("should handle child clarification when parent doesn't exist", () => {
    const stateWithEmptyClarifications = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          clarifications: [],
        },
      },
    };

    const state = guestDashboardSlice.reducer(
      stateWithEmptyClarifications,
      guestDashboardSlice.actions.mergeClarification(mockChildClarification),
    );

    expect(state.data!.contest.clarifications).toHaveLength(1);
    expect(state.data!.contest.clarifications[0]).toEqual(
      mockChildClarification,
    );
  });

  it("should delete a clarification by id", () => {
    const stateWithClarification = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          clarifications: [mockClarification],
        },
      },
    };

    const state = guestDashboardSlice.reducer(
      stateWithClarification,
      guestDashboardSlice.actions.deleteClarification("clarification-1"),
    );

    expect(state.data!.contest.clarifications).toHaveLength(0);
  });

  it("should not delete clarification if id doesn't match", () => {
    const stateWithClarification = {
      ...stateWithData,
      data: {
        ...stateWithData.data,
        contest: {
          ...mockContest,
          clarifications: [mockClarification],
        },
      },
    };

    const state = guestDashboardSlice.reducer(
      stateWithClarification,
      guestDashboardSlice.actions.deleteClarification("non-existent-id"),
    );

    expect(state.data!.contest.clarifications).toHaveLength(1);
    expect(state.data!.contest.clarifications[0]).toEqual(mockClarification);
  });
});
