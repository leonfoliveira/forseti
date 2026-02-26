import { v4 as uuidv4 } from "uuid";

import { mergeLeaderboard } from "@/app/_store/util/leaderboard-merger";
import { MockLeaderboardCellResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardCellResponseDTO";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/leaderboard/MockLeaderboardResponseDTO";

describe("mergeLeaderboard", () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe("when updating existing member and problem", () => {
    it("should update problem data and recalculate score/penalty", () => {
      const memberId = uuidv4();
      const problemId = uuidv4();
      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: memberId,
            memberName: "Test User",
            score: 0,
            penalty: 0,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: false,
                acceptedAt: undefined,
                wrongSubmissions: 0,
                penalty: 0,
              },
              {
                problemId: uuidv4(),
                problemLetter: "B",
                problemColor: "#000000",
                isAccepted: true,
                acceptedAt: "2025-01-01T12:00:00Z",
                wrongSubmissions: 1,
                penalty: 80,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:30:00Z",
        wrongSubmissions: 2,
        penalty: 70,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      const updatedMember = result.rows[0];
      const updatedProblem = updatedMember.cells.find(
        (p) => p.problemId === problemId,
      );

      expect(updatedProblem).toEqual({
        problemId: problemId,
        problemLetter: "A",
        problemColor: "#ffffff",
        isAccepted: true,
        acceptedAt: "2025-01-01T11:30:00Z",
        wrongSubmissions: 2,
        penalty: 70,
      });

      // Score should be count of accepted problems (2)
      expect(updatedMember.score).toBe(2);
      // Penalty should be sum of all problem penalties (70 + 80)
      expect(updatedMember.penalty).toBe(150);
    });

    it("should handle problem becoming unaccepted", () => {
      const memberId = uuidv4();
      const problemId = uuidv4();
      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: memberId,
            memberName: "Test User",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId,
        problemId,
        isAccepted: false,
        acceptedAt: undefined,
        wrongSubmissions: 3,
        penalty: 0,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      const updatedMember = result.rows[0];
      expect(updatedMember.score).toBe(0);
      expect(updatedMember.penalty).toBe(0);
    });
  });

  describe("when member is not found", () => {
    it("should return original leaderboard and log warning", () => {
      const leaderboard = MockLeaderboardResponseDTO();
      const partial = MockLeaderboardCellResponseDTO({
        memberId: "non-existent-member",
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result).toBe(leaderboard);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Received leaderboard update for member non-existent-member which is not in the current leaderboard`,
      );
    });
  });

  describe("when problem is not found", () => {
    it("should return original leaderboard and log warning", () => {
      const memberId = uuidv4();
      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: memberId,
            memberName: "Test User",
            score: 0,
            penalty: 0,
            cells: [],
          },
        ],
      });
      const partial = MockLeaderboardCellResponseDTO({
        memberId,
        problemId: "non-existent-problem",
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result).toBe(leaderboard);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `Received leaderboard update for problem non-existent-problem which is not in the current leaderboard`,
      );
    });
  });

  describe("sorting behavior", () => {
    it("should sort by score first (higher is better)", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "User A",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "User B",
            score: 2,
            penalty: 120,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
              {
                problemId: uuidv4(),
                problemLetter: "B",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T12:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:00Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result.rows[0].memberId).toBe(member2Id); // Higher score (2)
      expect(result.rows[1].memberId).toBe(member1Id); // Lower score (1)
    });

    it("should sort by penalty when scores are equal (lower is better)", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "User A",
            score: 1,
            penalty: 100,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 3,
                penalty: 100,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "User B",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:00Z",
        wrongSubmissions: 3,
        penalty: 100,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result.rows[0].memberId).toBe(member2Id); // Lower penalty (60)
      expect(result.rows[1].memberId).toBe(member1Id); // Higher penalty (100)
    });

    it("should sort by accepted times when score and penalty are equal", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "User A",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T12:00:00Z", // Later acceptance
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "User B",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z", // Earlier acceptance
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T12:00:00Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result.rows[0].memberId).toBe(member2Id); // Earlier acceptance time
      expect(result.rows[1].memberId).toBe(member1Id); // Later acceptance time
    });

    it("should treat acceptance times within the same minute as equal", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "User B", // Alphabetically second
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:45Z", // Same minute, different seconds
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "User A", // Alphabetically first
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:15Z", // Same minute, different seconds
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:45Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      // Should fall back to name sorting since acceptance times are in same minute
      expect(result.rows[0].memberName).toBe("User A"); // Alphabetically first
      expect(result.rows[1].memberName).toBe("User B"); // Alphabetically second
    });

    it("should sort by name when all other criteria are equal", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "Charlie",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "Alice",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:00Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      expect(result.rows[0].memberName).toBe("Alice"); // Alphabetically first
      expect(result.rows[1].memberName).toBe("Charlie"); // Alphabetically second
    });

    it("should handle members with different numbers of accepted problems", () => {
      const member1Id = uuidv4();
      const member2Id = uuidv4();
      const problemId = uuidv4();

      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: member1Id,
            memberName: "User A",
            score: 1,
            penalty: 60,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
          {
            memberId: member2Id,
            memberName: "User B",
            score: 3,
            penalty: 180,
            cells: [
              {
                problemId: uuidv4(),
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T11:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
              {
                problemId: uuidv4(),
                problemLetter: "B",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T12:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
              {
                problemId: uuidv4(),
                problemLetter: "C",
                problemColor: "#ffffff",
                isAccepted: true,
                acceptedAt: "2025-01-01T13:00:00Z",
                wrongSubmissions: 1,
                penalty: 60,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId: member1Id,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:00Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      // Should not throw error when comparing arrays of different lengths
      expect(result.rows[0].memberId).toBe(member2Id); // Higher score
      expect(result.rows[1].memberId).toBe(member1Id); // Lower score
    });
  });

  describe("penalty calculation edge cases", () => {
    it("should handle undefined penalties", () => {
      const memberId = uuidv4();
      const problemId = uuidv4();
      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: memberId,
            memberName: "Test User",
            score: 0,
            penalty: 0,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: false,
                acceptedAt: undefined,
                wrongSubmissions: 0,
                penalty: 0,
              },
              {
                problemId: uuidv4(),
                problemLetter: "B",
                problemColor: "#ffffff",
                isAccepted: false,
                acceptedAt: undefined,
                wrongSubmissions: 0,
                penalty: undefined as any, // undefined penalty
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId,
        problemId,
        isAccepted: true,
        acceptedAt: "2025-01-01T11:00:00Z",
        wrongSubmissions: 1,
        penalty: 60,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      const updatedMember = result.rows[0];
      expect(updatedMember.score).toBe(1);
      expect(updatedMember.penalty).toBe(60); // Should handle undefined penalty as 0
    });

    it("should handle zero penalties correctly", () => {
      const memberId = uuidv4();
      const problemId = uuidv4();
      const leaderboard = MockLeaderboardResponseDTO({
        rows: [
          {
            memberId: memberId,
            memberName: "Test User",
            score: 0,
            penalty: 0,
            cells: [
              {
                problemId: problemId,
                problemLetter: "A",
                problemColor: "#ffffff",
                isAccepted: false,
                acceptedAt: undefined,
                wrongSubmissions: 0,
                penalty: 0,
              },
            ],
          },
        ],
      });

      const partial = MockLeaderboardCellResponseDTO({
        memberId,
        problemId,
        isAccepted: false,
        acceptedAt: undefined,
        wrongSubmissions: 0,
        penalty: 0,
      });

      const result = mergeLeaderboard(leaderboard, partial);

      const updatedMember = result.rows[0];
      expect(updatedMember.score).toBe(0);
      expect(updatedMember.penalty).toBe(0);
    });
  });
});
