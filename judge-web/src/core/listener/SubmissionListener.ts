import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export interface SubmissionListener {
  subscribeForContest: (
    contestId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<ListenerClient>;

  subscribeForMember: (
    memberId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<ListenerClient>;

  subscribeForFail: (
    contestId: number,
    cb: (submission: SubmissionPrivateResponseDTO) => void,
  ) => Promise<ListenerClient>;
}
