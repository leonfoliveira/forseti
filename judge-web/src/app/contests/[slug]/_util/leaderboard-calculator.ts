import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { ContestLeaderboardResponseDTO } from "@/core/repository/dto/response/contest/ContestLeaderboardResponseDTO";

const WRONG_SUBMISSION_PENALTY = 1200;

export function recalculateLeaderboard(
  leaderboard: ContestLeaderboardResponseDTO,
  submission: SubmissionPublicResponseDTO,
): ContestLeaderboardResponseDTO {
  const member = leaderboard.classification.find(
    (it) => it.memberId === submission.member.id,
  );
  const problem = member?.problems.find(
    (it) => it.problemId === submission.problem.id,
  );

  if (!member || !problem || problem.isAccepted) return leaderboard;

  if (submission.answer === SubmissionAnswer.ACCEPTED) {
    const createdAt = new Date(submission.createdAt);
    const startAt = new Date(leaderboard.startAt);
    const diff = createdAt.getTime() - startAt.getTime();

    problem.penalty =
      problem.wrongSubmissions * WRONG_SUBMISSION_PENALTY +
      Math.floor(diff / 1000);
    problem.isAccepted = true;
  } else {
    problem.wrongSubmissions += 1;
  }

  member.penalty = member.problems.reduce((acc, it) => acc + it.penalty, 0);
  member.score = member.problems.reduce(
    (acc, it) => acc + (it.isAccepted ? 1 : 0),
    0,
  );

  leaderboard.classification.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.name.localeCompare(b.name);
  });

  return { ...leaderboard };
}
