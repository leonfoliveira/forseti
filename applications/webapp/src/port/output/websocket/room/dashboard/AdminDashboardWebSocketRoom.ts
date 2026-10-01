import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type AdminDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (submission: SubmissionWithCodeResponseDTO) => void;
  SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
};

export class AdminDashboardWebSocketRoom extends WebSocketRoom<AdminDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: AdminDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/admin`, callbacks);
  }
}
