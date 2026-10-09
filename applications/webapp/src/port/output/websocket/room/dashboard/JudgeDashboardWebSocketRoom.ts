import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";

export type JudgeDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionResponseDTO,
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
