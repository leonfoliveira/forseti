import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";

const WRONG_SUBMISSION_PENALTY = 1200;

export function recalculateContest(
  contest: WithStatus<ContestResponseDTO>,
  newSubmission: SubmissionPublicResponseDTO,
): WithStatus<ContestResponseDTO> {
  if (newSubmission.status === SubmissionStatus.JUDGING) return contest;

  const member = contest.members.find(
    (it) => it.id === newSubmission.member.id,
  );
  const memberProblem = member?.problems.find(
    (it) => it.id === newSubmission.problem.id,
  );

  if (!member || !memberProblem || memberProblem.isAccepted) return contest;

  if (newSubmission.answer === SubmissionAnswer.ACCEPTED) {
    const createdAt = new Date(newSubmission.createdAt);
    const startAt = new Date(contest.startAt);
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

  contest.members.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.name.localeCompare(b.name);
  });

  return { ...contest };
}
