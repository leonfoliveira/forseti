import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type JudgeDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (submission: SubmissionWithCodeResponseDTO) => void;
  SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
};

export class JudgeDashboardWebSocketRoom extends WebSocketRoom<JudgeDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: JudgeDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/judge`, callbacks);
  }
}
