import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { MemberWithLoginResponseDTO } from "@/port/dto/response/member/MemberWithLoginResponseDTO";
import { ProblemWithTestCasesResponseDTO } from "@/port/dto/response/problem/ProblemWithTestCasesResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export type AdminDashboardResponseDTO = {
  contest: ContestWithMembersAndProblemsResponseDTO;
  leaderboard: LeaderboardResponseDTO;
  members: MemberWithLoginResponseDTO[];
  problems: ProblemWithTestCasesResponseDTO[];
  submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
  announcements: AnnouncementResponseDTO[];
  clarifications: ClarificationResponseDTO[];
};
