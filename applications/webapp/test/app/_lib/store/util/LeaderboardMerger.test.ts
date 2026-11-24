import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { MockDate } from "@/test/mock/MockDate";
import {
  MockLeaderboardCellResponseDTO,
  MockLeaderboardResponseDTO,
} from "@/test/mock/response/MockDTOs";

describe("LeaderboardMerger", () => {
  it("should ignore update for row not found in the leaderboard", () => {
    const leaderboard = MockLeaderboardResponseDTO();
    const result = LeaderboardMerger.merge(
      leaderboard,
      MockLeaderboardCellResponseDTO(),
    );
    expect(result).toBe(leaderboard);
  });

  it("should ignore update for cell not found in the leaderboard row", () => {
    const leaderboard = MockLeaderboardResponseDTO();
    const row = leaderboard.rows[0];
    const result = LeaderboardMerger.merge(leaderboard, {
      ...MockLeaderboardCellResponseDTO(),
      memberId: row.memberId,
    });
    expect(result).toBe(leaderboard);
  });

  it("should update an existing cell and sort the leaderboard", () => {
    const leaderboard = MockLeaderboardResponseDTO();
    const problemId = leaderboard.rows[0].cells[0].problemId;
    const now = MockDate.now();

    const row1 = {
      ...MockLeaderboardResponseDTO().rows[0],
      memberName: "E",
      score: 0,
      penalty: 0,
    };
    const row2 = {
      ...MockLeaderboardResponseDTO().rows[0],
      memberName: "D",
      score: 1,
      penalty: 10,
    };
    const row3 = {
      ...MockLeaderboardResponseDTO().rows[0],
      memberName: "C",
      score: 1,
      penalty: 1,
    };
    const row4 = {
      ...MockLeaderboardResponseDTO().rows[0],
      memberName: "B",
      score: 1,
      penalty: 1,
    };
    const row5 = {
      ...MockLeaderboardResponseDTO().rows[0],
      memberName: "A",
      score: 0,
      penalty: 0,
    };

    const cell1 = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId,
      isAccepted: false,
      penalty: 0,
    };
    const cell2 = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId,
      isAccepted: true,
      acceptedAt: now.toISOString(),
      penalty: 10,
    };
    const cell3 = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId,
      isAccepted: true,
      acceptedAt: now.past(1).toISOString(),
      penalty: 1,
    };
    const cell4 = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId,
      isAccepted: true,
      acceptedAt: now.past(2).toISOString(),
      penalty: 1,
    };
    const cell5 = {
      ...MockLeaderboardResponseDTO().rows[0].cells[0],
      problemId,
      isAccepted: false,
      penalty: 0,
    };

    row1.cells = [cell1];
    row2.cells = [cell2];
    row3.cells = [cell3];
    row4.cells = [cell4];
    row5.cells = [cell5];
    leaderboard.rows = [row1, row2, row3, row4, row5];

    const result = LeaderboardMerger.merge(
      leaderboard,
      MockLeaderboardCellResponseDTO({
        problemId,
        memberId: row5.memberId,
        isAccepted: true,
        acceptedAt: now.past(2).toISOString(),
        penalty: 1,
      }),
    );

    expect(result.rows[0].memberName).toBe("A");
    expect(result.rows[0].score).toBe(1);
    expect(result.rows[0].penalty).toBe(1);
    expect(result.rows[0].cells[0].isAccepted).toBe(true);
    expect(result.rows[0].cells[0].penalty).toBe(1);

    expect(result.rows[1].memberName).toBe("B");
    expect(result.rows[1].score).toBe(1);
    expect(result.rows[1].penalty).toBe(1);

    expect(result.rows[2].memberName).toBe("C");
    expect(result.rows[2].score).toBe(1);
    expect(result.rows[2].penalty).toBe(1);

    expect(result.rows[3].memberName).toBe("D");
    expect(result.rows[3].score).toBe(1);
    expect(result.rows[3].penalty).toBe(10);

    expect(result.rows[4].memberName).toBe("E");
    expect(result.rows[4].score).toBe(0);
    expect(result.rows[4].penalty).toBe(0);
  });
});
