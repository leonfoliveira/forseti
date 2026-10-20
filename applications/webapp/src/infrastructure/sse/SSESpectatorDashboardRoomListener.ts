import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SpectatorDashboardRoomListener } from "@/port/output/sse/SpectatorDashboardRoomListener";
import { SSERoomListener } from "@/infrastructure/sse/SSERoomListener";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";
import { LeaderboardResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { ContestResponseDTO } from "@/port/dto/response/contest/ContestResponseDTO";

export class SSESpectatorDashboardRoomListener
  extends SSERoomListener
  implements SpectatorDashboardRoomListener
{
  private basePath = (contestId: string) =>
    `/v1/sse/contests/${contestId}/dashboard/spectator`;

  constructor(apiUrl: string) {
    super(apiUrl);
  }

  async subscribe(
    contestId: string,
    listeners: {
      LEADERBOARD_UPDATED: (
        leaderboardCell: LeaderboardCellResponseDTO,
      ) => void;
      SUBMISSION_CREATED: (submission: SubmissionResponseDTO) => void;
      SUBMISSION_UPDATED: (submission: SubmissionResponseDTO) => void;
      ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
      CLARIFICATION_PUBLISHED: (
        clarification: ClarificationResponseDTO,
      ) => void;
      CONTEST_FROZEN: (contest: ContestResponseDTO) => void;
      CONTEST_UNFROZEN: (data: {
        contest: ContestResponseDTO;
        leaderboard: LeaderboardResponseDTO;
        submissions: SubmissionResponseDTO[];
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
