import { ClarificationListener } from "@/core/port/driven/listener/ClarificationListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export class StompClarificationListener implements ClarificationListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/clarifications`, cb);
  }

  async subscribeForMemberChildren(
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/clarifications/children/members/${memberId}`,
      cb,
    );
  }

  async subscribeForContestDeleted(
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/clarifications/deleted`,
      cb,
    );
  }
}
