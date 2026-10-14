import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export type JudgeDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
  CLARIFICATION_CREATED: (clarification: ClarificationResponseDTO) => void;
  CLARIFICATION_ANSWERED: (clarification: ClarificationResponseDTO) => void;
  CLARIFICATION_PUBLISHED: (clarification: ClarificationResponseDTO) => void;
};

export class JudgeDashboardWebSocketRoom extends WebSocketRoom<JudgeDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: JudgeDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/judge`, callbacks);
  }
}
