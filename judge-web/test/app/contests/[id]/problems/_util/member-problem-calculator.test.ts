import { recalculateMemberProblems } from "@/app/contests/[id]/problems/_util/member-problem-calculator";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ProblemWithStatusResponseDTO } from "@/core/repository/dto/response/ProblemWithStatusResponseDTO";

it("returns undefined when member problems are undefined", () => {
  const result = recalculateMemberProblems(undefined, {
    problem: { id: 1 },
    status: SubmissionStatus.ACCEPTED,
  } as SubmissionPublicResponseDTO);

  expect(result).toBeUndefined();
});

it("does not modify member problems when submission problem ID does not match", () => {
  const memberProblems = [
    { id: 1, isAccepted: false, wrongSubmissions: 0 },
  ] as ProblemWithStatusResponseDTO[];

  const result = recalculateMemberProblems(memberProblems, {
    problem: { id: 2 },
    status: SubmissionStatus.ACCEPTED,
  } as SubmissionPublicResponseDTO);

  expect(result).toEqual(memberProblems);
});

it("updates the problem member when submission problem ID matches and is accepted", () => {
  const memberProblems = [
    { id: 1, isAccepted: false, wrongSubmissions: 2 },
  ] as ProblemWithStatusResponseDTO[];

  const result = recalculateMemberProblems(memberProblems, {
    problem: { id: 1 },
    status: SubmissionStatus.ACCEPTED,
  } as SubmissionPublicResponseDTO);

  expect(result).toEqual([{ id: 1, isAccepted: true, wrongSubmissions: 2 }]);
});

it("increments wrong submissions when submission problem ID matches and is not accepted", () => {
  const memberProblems = [
    { id: 1, isAccepted: false, wrongSubmissions: 2 },
  ] as ProblemWithStatusResponseDTO[];

  const result = recalculateMemberProblems(memberProblems, {
    problem: { id: 1 },
    status: SubmissionStatus.WRONG_ANSWER,
  } as SubmissionPublicResponseDTO);

  expect(result).toEqual([{ id: 1, isAccepted: false, wrongSubmissions: 3 }]);
});
