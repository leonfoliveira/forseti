import { DateTimeUtil } from "@/app/_lib/util/datetime-util";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

/**
 * Replaces a leaderboard cell and recalculates the ranks based on the new data.
 *
 * @param leaderboard The current leaderboard to be updated.
 * @param leaderboardPartial The partial leaderboard data containing the updated cell.
 */
export function mergeLeaderboard(
  leaderboard: LeaderboardResponseDTO,
  leaderboardPartial: LeaderboardCellResponseDTO,
): LeaderboardResponseDTO {
  const row = leaderboard.rows.find(
    (it) => it.memberId === leaderboardPartial.memberId,
  );

  if (!row) {
    console.warn(
      `Received leaderboard update for member ${leaderboardPartial.memberId} which is not in the current leaderboard`,
    );
    return leaderboard;
  }

  const cell = row.cells.find(
    (it) => it.problemId === leaderboardPartial.problemId,
  );

  if (!cell) {
    console.warn(
      `Received leaderboard update for problem ${leaderboardPartial.problemId} which is not in the current leaderboard`,
    );
    return leaderboard;
  }

  cell.isAccepted = leaderboardPartial.isAccepted;
  cell.acceptedAt = leaderboardPartial.acceptedAt;
  cell.wrongSubmissions = leaderboardPartial.wrongSubmissions;
  cell.penalty = leaderboardPartial.penalty;

  row.score = row.cells.filter((it) => it.isAccepted).length;
  row.penalty = row.cells.reduce((sum, it) => sum + (it.penalty || 0), 0);

  leaderboard.rows.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }

    const aAcceptedTimes = a.cells
      .filter((it) => it.isAccepted)
      .toSorted((a, b) => a.acceptedAt!.localeCompare(b.acceptedAt!))
      .toReversed();
    const bAcceptedTimes = b.cells
      .filter((it) => it.isAccepted)
      .toSorted((a, b) => a.acceptedAt!.localeCompare(b.acceptedAt!))
      .toReversed();

    const minLength = Math.min(aAcceptedTimes.length, bAcceptedTimes.length);
    for (let i = 0; i < minLength; i++) {
      const acceptedDiff = Math.floor(
        DateTimeUtil.diffMs(
          leaderboard.contestStartAt,
          aAcceptedTimes[i].acceptedAt!,
        ) /
          1000 /
          60,
      );
      const acceptedDiffB = Math.floor(
        DateTimeUtil.diffMs(
          leaderboard.contestStartAt,
          bAcceptedTimes[i].acceptedAt!,
        ) /
          1000 /
          60,
      );

      const cmp = acceptedDiff - acceptedDiffB;
      if (cmp !== 0) {
        return cmp;
      }
    }

    return a.memberName.localeCompare(b.memberName);
  });

  return { ...leaderboard };
}
