import { LeaderboardMerger } from "@/app/_lib/store/util/LeaderboardMerger";
import { MemberType } from "@/domain/enumerate/MemberType";
import { MockLeaderboardResponseDTO } from "@/test/mock/response/MockDTOs";

describe("LeaderboardMerger", () => {
  it("updates cells, recalculates score and penalty, and ranks rows", () => {
    const leaderboard = MockLeaderboardResponseDTO({
      rows: [
        {
          memberId: "member-1", memberName: "Zoe", memberType: MemberType.CONTESTANT,
          score: 0, penalty: 0,
          cells: [{ problemId: "problem-1", problemLetter: "A", problemColor: "#fff", isAccepted: false, wrongSubmissions: 0, penalty: 0 }],
        },
        {
          memberId: "member-2", memberName: "Ada", memberType: MemberType.CONTESTANT,
          score: 1, penalty: 20,
          cells: [{ problemId: "problem-1", problemLetter: "A", problemColor: "#fff", isAccepted: true, acceptedAt: "2026-01-01T00:20:00Z", wrongSubmissions: 0, penalty: 20 }],
        },
      ],
    });
    const result = LeaderboardMerger.merge(leaderboard, {
      memberId: "member-1", problemId: "problem-1", problemLetter: "A", problemColor: "#fff",
      letter: "A", isAccepted: true, acceptedAt: "2026-01-01T00:10:00Z", wrongSubmissions: 1, penalty: 15,
    });
    expect(result.rows[0]).toMatchObject({ memberId: "member-1", score: 1, penalty: 15 });
    expect(result.rows[0].cells[0]).toMatchObject({ isAccepted: true, wrongSubmissions: 1 });
  });

  it("returns the original leaderboard and warns about unknown members", () => {
    const leaderboard = MockLeaderboardResponseDTO();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(LeaderboardMerger.merge(leaderboard, {
      memberId: "missing", problemId: "problem-1", problemLetter: "A", problemColor: "#fff",
      letter: "A", isAccepted: true, wrongSubmissions: 0, penalty: 0,
    })).toBe(leaderboard);
    expect(warn).toHaveBeenCalled();
  });
});
