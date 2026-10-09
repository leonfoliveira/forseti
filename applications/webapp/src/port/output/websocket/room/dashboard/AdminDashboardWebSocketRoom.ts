import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";

export type AdminDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionResponseDTO,
  ) => void;
};

export class AdminDashboardWebSocketRoom extends WebSocketRoom<AdminDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: AdminDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/admin`, callbacks);
  }
}
