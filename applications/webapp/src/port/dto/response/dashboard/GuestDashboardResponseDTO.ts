import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberResponseDTO } from "@/port/dto/response/member/MemberResponseDTO";
import { ProblemResponseDTO } from "@/port/dto/response/problem/ProblemResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type GuestDashboardResponseDTO = {
  contest: ContestResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberResponseDTO[];
  problems: ProblemResponseDTO[];
  submissions: SubmissionResponseDTO[];
};
