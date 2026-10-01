import { ContestWithMembersAndProblemsDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberWithLoginResponseDTO } from "@/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestWithMembersAndProblemsDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberWithLoginResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeResponseDTO[];
};
