import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";
import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { contestantDashboardSlice } from "@/store/slices/contestant-dashboard-slice";

describe("contestantDashboardSlice", () => {
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

  const mockMemberSubmission: SubmissionFullResponseDTO = {
    id: "submission-2",
    problem: {
      id: "problem-1",
      letter: "A",
      title: "Problem A",
      timeLimit: 1000,
      memoryLimit: 256,
      description: {
        id: "desc-1",
        filename: "description.pdf",
        contentType: "application/pdf",
      },
      testCases: {
        id: "test-1",
        filename: "testcases.zip",
        contentType: "application/zip",
      },
    },
    member: {
      id: "member-1",
      name: "Test Member",
      type: "CONTESTANT" as any,
      login: "testmember",
    },
    language: Language.PYTHON_3_13,
    status: SubmissionStatus.JUDGED,
    answer: SubmissionAnswer.WRONG_ANSWER,
    code: { id: "code-1", filename: "solution.py", contentType: "text/plain" },
    createdAt: "2023-01-01T11:30:00Z",
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
    contest: mockContest,
    leaderboard: mockLeaderboard,
    submissions: [mockSubmission],
    memberSubmissions: [mockMemberSubmission],
  };

  it("should set the initial state correctly", () => {
    const state = contestantDashboardSlice.reducer(undefined, {
      type: "@@INIT",
    });
    expect(state).toBeNull();
  });

  it("should set the complete state", () => {
    const newState = {
      contest: mockContest,
      leaderboard: mockLeaderboard,
      submissions: [mockSubmission],
      memberSubmissions: [mockMemberSubmission],
    };

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.set(newState),
    );

    expect(state).toEqual(newState);
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

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.setLeaderboard(newLeaderboard),
    );

    expect(state.leaderboard).toEqual(newLeaderboard);
    expect(state.contest).toEqual(mockContest);
    expect(state.submissions).toEqual([mockSubmission]);
    expect(state.memberSubmissions).toEqual([mockMemberSubmission]);
  });

  it("should merge a new submission", () => {
    const newSubmission: SubmissionPublicResponseDTO = {
      id: "submission-3",
      problem: mockSubmission.problem,
      member: mockSubmission.member,
      language: Language.PYTHON_3_13,
      status: SubmissionStatus.JUDGING,
      answer: SubmissionAnswer.NO_ANSWER,
      createdAt: "2023-01-01T11:15:00Z",
    };

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.mergeSubmission(newSubmission),
    );

    expect(state.submissions).toHaveLength(2);
    expect(state.submissions).toContainEqual(mockSubmission);
    expect(state.submissions).toContainEqual(newSubmission);
  });

  it("should update an existing submission when merging", () => {
    const updatedSubmission: SubmissionPublicResponseDTO = {
      ...mockSubmission,
      status: SubmissionStatus.JUDGED,
      answer: SubmissionAnswer.WRONG_ANSWER,
    };

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.mergeSubmission(updatedSubmission),
    );

    expect(state.submissions).toHaveLength(1);
    expect(state.submissions[0]).toEqual(updatedSubmission);
  });

  it("should merge a new member submission", () => {
    const newMemberSubmission: SubmissionFullResponseDTO = {
      ...mockMemberSubmission,
      id: "submission-4",
      answer: SubmissionAnswer.ACCEPTED,
    };

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.mergeMemberSubmission(
        newMemberSubmission,
      ),
    );

    expect(state.memberSubmissions).toHaveLength(2);
    expect(state.memberSubmissions).toContainEqual(mockMemberSubmission);
    expect(state.memberSubmissions).toContainEqual(newMemberSubmission);
  });

  it("should update an existing member submission when merging", () => {
    const updatedMemberSubmission: SubmissionFullResponseDTO = {
      ...mockMemberSubmission,
      answer: SubmissionAnswer.ACCEPTED,
    };

    const state = contestantDashboardSlice.reducer(
      initialState,
      contestantDashboardSlice.actions.mergeMemberSubmission(
        updatedMemberSubmission,
      ),
    );

    expect(state.memberSubmissions).toHaveLength(1);
    expect(state.memberSubmissions[0]).toEqual(updatedMemberSubmission);
  });

  it("should merge a new announcement", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        announcements: [mockAnnouncement],
      },
    };

    const newAnnouncement: AnnouncementResponseDTO = {
      id: "announcement-2",
      createdAt: "2023-01-01T13:00:00Z",
      member: mockAnnouncement.member,
      text: "Another announcement",
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.mergeAnnouncement(newAnnouncement),
    );

    expect(state.contest.announcements).toHaveLength(2);
    expect(state.contest.announcements).toContainEqual(mockAnnouncement);
    expect(state.contest.announcements).toContainEqual(newAnnouncement);
  });

  it("should merge a new root clarification", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        clarifications: [],
      },
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.mergeClarification(mockClarification),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0]).toEqual(mockClarification);
  });

  it("should merge a child clarification to the correct parent", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        clarifications: [mockClarification],
      },
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.mergeClarification(
        mockChildClarification,
      ),
    );

    expect(state.contest.clarifications).toHaveLength(2);
    expect(state.contest.clarifications[0].children).toHaveLength(1);
    expect(state.contest.clarifications[0].children[0]).toEqual(
      mockChildClarification,
    );
  });

  it("should handle child clarification when parent doesn't exist", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        clarifications: [],
      },
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.mergeClarification(
        mockChildClarification,
      ),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0]).toEqual(mockChildClarification);
  });

  it("should delete a clarification by id", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        clarifications: [mockClarification],
      },
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.deleteClarification("clarification-1"),
    );

    expect(state.contest.clarifications).toHaveLength(0);
  });

  it("should not delete clarification if id doesn't match", () => {
    const stateWithContest = {
      ...initialState,
      contest: {
        ...mockContest,
        clarifications: [mockClarification],
      },
    };

    const state = contestantDashboardSlice.reducer(
      stateWithContest,
      contestantDashboardSlice.actions.deleteClarification("non-existent-id"),
    );

    expect(state.contest.clarifications).toHaveLength(1);
    expect(state.contest.clarifications[0]).toEqual(mockClarification);
  });
});
