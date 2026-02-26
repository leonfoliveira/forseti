import { BroadcastRoom } from "@/core/port/driven/broadcast/BroadcastRoom";
import { AnnouncementResponseDTO } from "@/core/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";
import { LeaderboardCellResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { LeaderboardResponseDTO } from "@/core/port/dto/response/leaderboard/LeaderboardResponseDTO";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";

export type GuestDashboardBroadcastCallbacks = {
  ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
  CLARIFICATION_CREATED: (clarification: ClarificationResponseDTO) => void;
  CLARIFICATION_DELETED: (data: { id: string }) => void;
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  LEADERBOARD_FROZEN: () => void;
  LEADERBOARD_UNFROZEN: (data: {
    leaderboard: LeaderboardResponseDTO;
    frozenSubmissions: SubmissionResponseDTO[];
  }) => void;
  SUBMISSION_CREATED: (submission: SubmissionResponseDTO) => void;
  SUBMISSION_UPDATED: (submission: SubmissionResponseDTO) => void;
};

export class GuestDashboardBroadcastRoom extends BroadcastRoom<GuestDashboardBroadcastCallbacks> {
  constructor(
    contestId: string,
    public callbacks: GuestDashboardBroadcastCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/guest`, callbacks);
  }
}
