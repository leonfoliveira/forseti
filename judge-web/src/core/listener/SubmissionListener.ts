import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { CompatClient } from "@stomp/stompjs";

export interface SubmissionListener {
  subscribeForContest: (
    contestId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<CompatClient>;

  subscribeForMember: (
    memberId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<CompatClient>;

  unsubscribe(client: CompatClient): Promise<void>;
}
