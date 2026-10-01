import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type JudgeDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeResponseDTO[];
};
