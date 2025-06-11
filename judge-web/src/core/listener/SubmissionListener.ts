import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface SubmissionListener {
  subscribeForContest: (
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<ListenerClient>;

  subscribeForContestFull: (
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ) => Promise<ListenerClient>;
}
