import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";

export type JudgeDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeAndExecutionResponseDTO[];
};
