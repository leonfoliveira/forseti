import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { StaffDashboardRoomListener } from "@/port/output/sse/StaffDashboardRoomListener";
import { SSERoomListener } from "@/infrastructure/sse/SSERoomListener";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export class SSEStaffDashboardRoomListener
  extends SSERoomListener
  implements StaffDashboardRoomListener
{
  private basePath = (contestId: string) =>
    `/v1/sse/contests/${contestId}/dashboard/staff`;

  constructor(apiUrl: string) {
    super(apiUrl);
  }

  async subscribe(
    contestId: string,
    listeners: {
      LEADERBOARD_UPDATED: (
        leaderboardCell: LeaderboardCellResponseDTO,
      ) => void;
      SUBMISSION_CREATED: (submission: SubmissionWithCodeResponseDTO) => void;
      SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
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
