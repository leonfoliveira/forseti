import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

export type JudgeDashboardBroadcastRoomCallbacks = {
  ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
  CLARIFICATION_CREATED: (clarification: ClarificationResponseDTO) => void;
  CLARIFICATION_DELETED: (data: { id: string }) => void;
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  LEADERBOARD_FROZEN: () => void;
  LEADERBOARD_UNFROZEN: (leaderboard: LeaderboardResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
};

export class JudgeDashboardBroadcastRoom extends BroadcastRoom<JudgeDashboardBroadcastRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: JudgeDashboardBroadcastRoomCallbacks,
  ) {
    super(`contests/${contestId}/judge`, callbacks);
  }
}
