import { WebSocketRoom } from "@/port/output/websocket/WebSocketRoom";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export type ContestantPrivateWebSocketRoomCallbacks = {
  SUBMISSION_UPDATED: (submission: SubmissionWithCodeResponseDTO) => void;
};

export class ContestantPrivateWebSocketRoom extends WebSocketRoom<ContestantPrivateWebSocketRoomCallbacks> {
  constructor(
    contestId: string,
    memberId: string,
    public callbacks: ContestantPrivateWebSocketRoomCallbacks,
  ) {
    super(
      `/contests/${contestId}/members/${memberId}/private/contestant`,
      callbacks,
    );
  }
}
