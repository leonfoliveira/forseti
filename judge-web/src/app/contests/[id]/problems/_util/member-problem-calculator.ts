import { ProblemWithStatusResponseDTO } from "@/core/repository/dto/response/ProblemWithStatusResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";

export function recalculateMemberProblems(
  memberProblems: ProblemWithStatusResponseDTO[] | undefined,
  submission: SubmissionPublicResponseDTO,
): ProblemWithStatusResponseDTO[] | undefined {
  if (!memberProblems) return undefined;
  return memberProblems.map((problem) => {
    if (problem.id !== submission.problem.id) return problem;
    return recalculateMemberProblem(problem, submission);
  });
}

export function recalculateMemberProblem(
  problemMember: ProblemWithStatusResponseDTO,
  submission: SubmissionPublicResponseDTO,
): ProblemWithStatusResponseDTO {
  return {
    ...problemMember,
    isAccepted: submission.status === SubmissionStatus.ACCEPTED,
    wrongSubmissions:
      problemMember.wrongSubmissions +
      (submission.status !== SubmissionStatus.ACCEPTED ? 1 : 0),
  };
}
