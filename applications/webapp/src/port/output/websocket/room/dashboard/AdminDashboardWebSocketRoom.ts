import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { LeaderboardCellResponseDTO } from "@/port/dto/response/leaderboard/LeaderboardCellResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { AnnouncementResponseDTO } from "@/port/dto/response/announcement/AnnouncementResponseDTO";

export type AdminDashboardWebSocketRoomCallbacks = {
  LEADERBOARD_UPDATED: (leaderboardCell: LeaderboardCellResponseDTO) => void;
  SUBMISSION_CREATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  SUBMISSION_UPDATED: (
    submission: SubmissionWithCodeAndExecutionsResponseDTO,
  ) => void;
  ANNOUNCEMENT_CREATED: (announcement: AnnouncementResponseDTO) => void;
};

export class AdminDashboardWebSocketRoom extends WebSocketRoom<AdminDashboardWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    public callbacks: AdminDashboardWebSocketRoomCallbacks,
  ) {
    super(`/contests/${contestId}/dashboard/admin`, callbacks);
  }
}
