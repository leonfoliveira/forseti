import { ContestPublicResponseDTO } from "@/core/repository/dto/response/contest/ContestPublicResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Language } from "@/core/domain/enumerate/Language";
import { recalculateLeaderboard } from "@/app/contests/[id]/leaderboard/util/leaderboard-calculator";

describe("recalculateLeaderboard", () => {
  const WRONG_SUBMISSION_PENALTY = 1200;

  let initialLeaderboard: ContestPublicResponseDTO;
  let submissionAccepted: SubmissionPublicResponseDTO;
  let submissionWrongAnswer: SubmissionPublicResponseDTO;
  let submissionJudging: SubmissionPublicResponseDTO;

  beforeEach(() => {
    initialLeaderboard = {
      contest: {
        id: 1,
        title: "Test Contest",
        startAt: "2025-01-01T10:00:00.000Z",
        endAt: "2025-01-01T12:00:00.000Z",
      },
      problems: [
        {
          id: 1,
          title: "Problem A",
        },
        {
          id: 2,
          title: "Problem B",
        },
        {
          id: 3,
          title: "Problem C",
        },
      ],
      members: [
        {
          id: 1,
          name: "Alice",
          score: 1,
          penalty: 3000,
          problems: [
            {
              id: 1,
              isAccepted: true,
              wrongSubmissions: 1,
              penalty: 3000,
            },
            {
              id: 2,
              isAccepted: false,
              wrongSubmissions: 2,
              penalty: 0,
            },
            {
              id: 3,
              isAccepted: false,
              wrongSubmissions: 0,
              penalty: 0,
            },
          ],
        },
        {
          id: 2,
          name: "Bob",
          score: 0,
          penalty: 0,
          problems: [
            {
              id: 1,
              isAccepted: false,
              wrongSubmissions: 0,
              penalty: 0,
            },
            {
              id: 2,
              isAccepted: false,
              wrongSubmissions: 0,
              penalty: 0,
            },
            {
              id: 3,
              isAccepted: false,
              wrongSubmissions: 0,
              penalty: 0,
            },
          ],
        },
      ],
    };

    submissionAccepted = {
      id: 1,
      problem: { id: 2, title: "Problem B" },
      member: { id: 1, name: "Alice" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.ACCEPTED,
      createdAt: "2025-01-01T10:01:00.000Z",
    };

    submissionWrongAnswer = {
      id: 2,
      problem: { id: 1, title: "Problem A" },
      member: { id: 2, name: "Bob" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.WRONG_ANSWER,
      createdAt: "2025-01-01T10:05:00.000Z",
    };

    submissionJudging = {
      id: 3,
      problem: { id: 3, title: "Problem C" },
      member: { id: 1, name: "Alice" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.JUDGING,
      createdAt: "2025-01-01T10:10:00.000Z",
    };
  });

  it("should return undefined if leaderboard is undefined", () => {
    const result = recalculateLeaderboard(undefined, submissionAccepted);
    expect(result).toBeUndefined();
  });

  it("should return the original leaderboard if submission status is JUDGING", () => {
    const originalLeaderboard = JSON.parse(JSON.stringify(initialLeaderboard));
    const result = recalculateLeaderboard(
      initialLeaderboard,
      submissionJudging,
    );
    expect(result).toEqual(originalLeaderboard);
  });

  it("should not modify leaderboard if member or problem not found, or problem already accepted", () => {
    const originalLeaderboard = JSON.parse(JSON.stringify(initialLeaderboard));

    const submissionNewMember = {
      ...submissionAccepted,
      member: { id: 3, name: "Xavier" },
    } as SubmissionPublicResponseDTO;
    let result = recalculateLeaderboard(
      initialLeaderboard,
      submissionNewMember,
    );
    expect(result).toEqual(originalLeaderboard);

    const submissionAlreadyAccepted = {
      ...submissionAccepted,
      problem: { id: 1, title: "Problem A" },
    } as SubmissionPublicResponseDTO;
    result = recalculateLeaderboard(
      initialLeaderboard,
      submissionAlreadyAccepted,
    );
    expect(result).toEqual(originalLeaderboard);

    const submissionNewProblemForExistingMember = {
      ...submissionAccepted,
      problem: { id: 4, title: "Problem Z" },
    } as SubmissionPublicResponseDTO;
    result = recalculateLeaderboard(
      initialLeaderboard,
      submissionNewProblemForExistingMember,
    );
    expect(result).toEqual(originalLeaderboard);
  });

  describe("when a submission is ACCEPTED", () => {
    it("should update penalty, set isAccepted to true, update member score and penalty, and re-sort leaderboard", () => {
      const result = recalculateLeaderboard(
        initialLeaderboard,
        submissionAccepted,
      )!;

      const expectedProblemBPenalty =
        initialLeaderboard.members[0].problems[1].wrongSubmissions *
          WRONG_SUBMISSION_PENALTY +
        60;

      const updatedMember1 = result.members.find((m) => m.id === 1)!;
      const updatedProblemB = updatedMember1.problems.find((p) => p.id === 2)!;
      expect(updatedProblemB.isAccepted).toBe(true);
      expect(updatedProblemB.penalty).toBe(expectedProblemBPenalty);

      expect(updatedMember1.score).toBe(2);
      expect(updatedMember1.penalty).toBe(3000 + expectedProblemBPenalty);

      expect(result.members[0].id).toBe(1);
      expect(result.members[1].id).toBe(2);
    });

    it("should calculate penalty correctly for a submission with a large time difference", () => {
      const submissionAcceptedLate = {
        ...submissionAccepted,
        createdAt: "2025-01-01T11:00:00.000Z",
      } as SubmissionPublicResponseDTO;

      const result = recalculateLeaderboard(
        initialLeaderboard,
        submissionAcceptedLate,
      )!;

      const expectedProblemBPenalty =
        initialLeaderboard.members[0].problems[1].wrongSubmissions *
          WRONG_SUBMISSION_PENALTY +
        3600;

      const updatedMember1 = result.members.find((m) => m.id === 1)!;
      const updatedProblemB = updatedMember1.problems.find((p) => p.id === 2)!;
      expect(updatedProblemB.penalty).toBe(expectedProblemBPenalty);
    });
  });

  describe("when a submission is NOT ACCEPTED (e.g., WRONG_ANSWER)", () => {
    it("should increment wrongSubmissions and update member penalty, and re-sort leaderboard", () => {
      const originalWrongSubmissionsBobProblemA =
        initialLeaderboard.members[1].problems[0].wrongSubmissions;

      const result = recalculateLeaderboard(
        initialLeaderboard,
        submissionWrongAnswer,
      )!;

      const updatedMember2 = result.members.find((m) => m.id === 2)!;
      const updatedProblemA = updatedMember2.problems.find((p) => p.id === 1)!;
      expect(updatedProblemA.wrongSubmissions).toBe(
        originalWrongSubmissionsBobProblemA + 1,
      );
      expect(updatedProblemA.isAccepted).toBe(false);
      expect(updatedProblemA.penalty).toBe(0);

      expect(updatedMember2.score).toBe(0);
      expect(updatedMember2.penalty).toBe(0);

      expect(result.members[0].id).toBe(1);
      expect(result.members[1].id).toBe(2);
    });
  });

  it("should handle multiple submissions and correct leaderboard sorting", () => {
    let updatedLeaderboard = recalculateLeaderboard(
      initialLeaderboard,
      submissionWrongAnswer,
    );

    const bobAcceptsProblemA = {
      id: 4,
      problem: { id: 1, title: "Problem A" },
      member: { id: 2, name: "Bob" },
      language: Language.PYTHON_3_13_3,
      status: SubmissionStatus.ACCEPTED,
      createdAt: "2025-01-01T10:02:00.000Z",
    } as SubmissionPublicResponseDTO;

    updatedLeaderboard = recalculateLeaderboard(
      updatedLeaderboard,
      bobAcceptsProblemA,
    )!;

    expect(updatedLeaderboard.members[0].id).toBe(2);
    expect(updatedLeaderboard.members[1].id).toBe(1);

    const updatedBob = updatedLeaderboard.members.find((m) => m.id === 2)!;
    expect(updatedBob.score).toBe(1);
    expect(updatedBob.penalty).toBe(1320);

    const updatedBobProblemA = updatedBob.problems.find((p) => p.id === 1)!;
    expect(updatedBobProblemA.isAccepted).toBe(true);
    expect(updatedBobProblemA.wrongSubmissions).toBe(1);
    expect(updatedBobProblemA.penalty).toBe(1320);
  });

  it("should return a new leaderboard object reference", () => {
    const originalLeaderboard = initialLeaderboard;
    const result = recalculateLeaderboard(
      initialLeaderboard,
      submissionAccepted,
    )!;
    expect(result).not.toBe(originalLeaderboard);
  });
});
