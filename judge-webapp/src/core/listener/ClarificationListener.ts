import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationListener {
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ) => Promise<ListenerClient>;

  subscribeForContestDeleted: (
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ) => Promise<ListenerClient>;
}
