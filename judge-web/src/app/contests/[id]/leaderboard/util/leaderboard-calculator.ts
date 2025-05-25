import { LeaderboardOutputDTO } from "@/core/repository/dto/response/LeaderboardOutputDTO";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

const WRONG_SUBMISSION_PENALTY = 1200;

export function recalculateLeaderboard(
  leaderboard: LeaderboardOutputDTO | undefined,
  newSubmission: SubmissionEmmitDTO,
): LeaderboardOutputDTO | undefined {
  if (!leaderboard) return undefined;
  if (newSubmission.status === SubmissionStatus.JUDGING) return leaderboard;

  const member = leaderboard.members.find(
    (it) => it.id === newSubmission.member.id,
  );
  const memberProblem = member?.problems.find(
    (it) => it.id === newSubmission.problem.id,
  );

  if (!member || !memberProblem || memberProblem.isAccepted) return leaderboard;

  if (newSubmission.status === SubmissionStatus.ACCEPTED) {
    const createdAt = new Date(newSubmission.createdAt);
    const startAt = new Date(leaderboard.contest.startAt);
    const diff = createdAt.getTime() - startAt.getTime();

    const updatedMemberProblem = {
      ...memberProblem,
      penalty:
        memberProblem.wrongSubmissions * WRONG_SUBMISSION_PENALTY +
        Math.floor(diff / 1000),
      isAccepted: true,
    };
    member.problems = member.problems.map((it) =>
      it.id === updatedMemberProblem.id ? updatedMemberProblem : it,
    );
  } else {
    const updatedMemberProblem = {
      ...memberProblem,
      wrongSubmissions: memberProblem.wrongSubmissions + 1,
    };
    member.problems = member.problems.map((it) =>
      it.id === updatedMemberProblem.id ? updatedMemberProblem : it,
    );
  }

  member.penalty = member.problems.reduce((acc, it) => acc + it.penalty, 0);
  member.score = member.problems.reduce(
    (acc, it) => acc + (it.isAccepted ? 1 : 0),
    0,
  );

  leaderboard.members.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.name.localeCompare(b.name);
  });

  return { ...leaderboard };
}
