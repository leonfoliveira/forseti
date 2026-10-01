import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionResponseDTO } from "@/port/dto/response/submission/SubmissionResponseDTO";

export type ContestantDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (submission: SubmissionResponseDTO) => void;
  SUBMISSION_UPDATED: (submission: SubmissionResponseDTO) => void;
};

export class ContestantDashboardWebSocketRoom extends WebSocketRoom<ContestantDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: ContestantDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/contestant`, callbacks);
  }
}
