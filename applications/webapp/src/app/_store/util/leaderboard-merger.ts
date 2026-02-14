import { LeaderboardPartialResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardPartialResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";

/**
 * Replaces a leaderboard cell and recalculates the ranks based on the new data.
 *
 * @param leaderboard The current leaderboard to be updated.
 * @param leaderboardPartial The partial leaderboard data containing the updated cell.
 */
export function mergeLeaderboard(
  leaderboard: LeaderboardResponseDTO,
  leaderboardPartial: LeaderboardPartialResponseDTO,
): LeaderboardResponseDTO {
  const row = leaderboard.members.find(
    (it) => it.id === leaderboardPartial.memberId,
  );

  if (!row) {
    console.warn(
      `Received leaderboard update for member ${leaderboardPartial.memberId} which is not in the current leaderboard`,
    );
    return leaderboard;
  }

  const cell = row.problems.find(
    (it) => it.id === leaderboardPartial.problemId,
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

  row.score = row.problems.filter((it) => it.isAccepted).length;
  row.penalty = row.problems.reduce((sum, it) => sum + (it.penalty || 0), 0);

  leaderboard.members.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty;
    }

    const aAcceptedTimes = a.problems
      .filter((it) => it.isAccepted)
      .toSorted((a, b) => a.acceptedAt!.localeCompare(b.acceptedAt!))
      .toReversed();
    const bAcceptedTimes = b.problems
      .filter((it) => it.isAccepted)
      .toSorted((a, b) => a.acceptedAt!.localeCompare(b.acceptedAt!))
      .toReversed();

    const minLength = Math.min(aAcceptedTimes.length, bAcceptedTimes.length);
    for (let i = 0; i < minLength; i++) {
      const cmp = aAcceptedTimes[i].acceptedAt!.localeCompare(
        bAcceptedTimes[i].acceptedAt!,
      );
      if (cmp !== 0) {
        return cmp;
      }
    }

    return a.name.localeCompare(b.name);
  });

  return leaderboard;
}
