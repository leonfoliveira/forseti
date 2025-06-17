import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { ClarificationListener } from "@/core/listener/ClarificationListener";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export class StompClarificationListener implements ClarificationListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ): Promise<ListenerClient> {
    await client.subscribe(`/topic/contests/${contestId}/clarifications`, cb);
    return client;
  }

  async subscribeForContestDeleted(
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ): Promise<ListenerClient> {
    await client.subscribe(
      `/topic/contests/${contestId}/clarifications/deleted`,
      cb,
    );
    return client;
  }
}
