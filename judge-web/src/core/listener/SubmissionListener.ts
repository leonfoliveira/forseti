import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
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

  subscribeForMember: (
    memberId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<ListenerClient>;
}
