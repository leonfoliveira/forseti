import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { GuestDashboardRoomListener } from "@/port/output/sse/GuestDashboardRoomListener";
import { SSERoomListener } from "@/infrastructure/sse/SSERoomListener";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export class SSEGuestDashboardRoomListener
  extends SSERoomListener
  implements GuestDashboardRoomListener
{
  private basePath = (contestId: string) =>
    `/v1/sse/contests/${contestId}/dashboard/guest`;

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
    },
    onDisconnect?: () => void,
    onReconnect?: () => void,
  ): Promise<void> {
    return super.subscribe(
      this.basePath(contestId),
      listeners,
      onDisconnect,
      onReconnect,
    );
  }
}
