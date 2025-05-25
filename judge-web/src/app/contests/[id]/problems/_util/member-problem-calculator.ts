import { ProblemMemberResponseDTO } from "@/core/repository/dto/response/ProblemMemberResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

export function recalculateMemberProblems(
  memberProblems: ProblemMemberResponseDTO[] | undefined,
  submission: SubmissionEmmitDTO,
): ProblemMemberResponseDTO[] | undefined {
  if (!memberProblems) return undefined;
  return memberProblems.map((problem) => {
    if (problem.id !== submission.problem.id) return problem;
    return recalculateMemberProblem(problem, submission);
  });
}

export function recalculateMemberProblem(
  problemMember: ProblemMemberResponseDTO,
  submission: SubmissionEmmitDTO,
): ProblemMemberResponseDTO {
  return {
    ...problemMember,
    isAccepted: submission.status === SubmissionStatus.ACCEPTED,
    wrongSubmissions:
      problemMember.wrongSubmissions +
      (submission.status !== SubmissionStatus.ACCEPTED ? 1 : 0),
  };
}
