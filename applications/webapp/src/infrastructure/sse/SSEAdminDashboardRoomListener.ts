import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AdminDashboardRoomListener } from "@/port/output/sse/AdminDashboardRoomListener";
import { SSERoomListener } from "@/infrastructure/sse/SSERoomListener";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ContestWithMembersAndProblemsResponseDTO } from "@/port/dto/response/contest/ContestWithMembersAndProblemsResponseDTO";

export class SSEAdminDashboardRoomListener
  extends SSERoomListener
  implements AdminDashboardRoomListener
{
  private basePath = (contestId: string) =>
    `/v1/sse/contests/${contestId}/dashboard/admin`;

  constructor(apiUrl: string) {
    super(apiUrl);
  }

  async subscribe(
    contestId: string,
    listeners: {
      LEADERBOARD_UPDATED: (
        leaderboardCell: LeaderboardCellResponseDTO,
      ) => void;
      SUBMISSION_CREATED: (
        submission: SubmissionWithCodeAndExecutionsResponseDTO,
      ) => void;
      SUBMISSION_UPDATED: (
        submission: SubmissionWithCodeAndExecutionsResponseDTO,
      ) => void;
      ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
      CLARIFICATION_CREATED: (clarification: ClarificationResponseDTO) => void;
      CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
      CLARIFICATION_PUBLISHED: (
        clarification: ClarificationResponseDTO,
      ) => void;
      CONTEST_FROZEN: (
        contest: ContestWithMembersAndProblemsResponseDTO,
      ) => void;
      CONTEST_UNFROZEN: (data: {
        contest: ContestWithMembersAndProblemsResponseDTO;
        leaderboard: LeaderboardResponseDTO;
        submissions: SubmissionWithCodeAndExecutionsResponseDTO[];
      }) => void;
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return super._subscribe(
      this.basePath(contestId),
      listeners,
      onDisconnect,
      onReconnect,
    );
  }
}
