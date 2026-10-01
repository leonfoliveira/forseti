import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type GuestDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (submission: SubmissionResponseDTO) => void;
  SUBMISSION_UPDATED: (submission: SubmissionResponseDTO) => void;
};

export class GuestDashboardWebSocketRoom extends WebSocketRoom<GuestDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: GuestDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/guest`, callbacks);
  }
}
