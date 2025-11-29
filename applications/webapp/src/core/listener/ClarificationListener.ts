import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationListener {
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ) => Promise<void>;

  subscribeForMemberChildren: (
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ) => Promise<void>;

  subscribeForContestDeleted: (
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ) => Promise<void>;
}
