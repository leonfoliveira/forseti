import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface SubmissionListener {
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<void>;

  subscribeForContestFull: (
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ) => Promise<void>;

  subscribeForMember: (
    client: ListenerClient,
    memberId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<void>;
}
