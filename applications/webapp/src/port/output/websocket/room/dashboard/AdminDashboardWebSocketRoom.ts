import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/port/dto/response/clarification/ClarificationResponseDTO";

export type AdminDashboardWebSocketRoomCallbacks = {
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

export class AdminDashboardWebSocketRoom extends WebSocketRoom<AdminDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: AdminDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/admin`, callbacks);
  }
}
