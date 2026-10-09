import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";

export type JudgeDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
};

export class JudgeDashboardWebSocketRoom extends WebSocketRoom<JudgeDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: JudgeDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/judge`, callbacks);
  }
}
