import { ClarificationListener } from "@/core/port/driven/listener/ClarificationListener";
import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export class StompClarificationListener implements ClarificationListener {
  /**
   * Subscribe to clarifications updates for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle received clarifications.
   */
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/clarifications`, cb);
  }

  /**
   * Subscribe to clarifications updates for the answers of a member in a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param memberId ID of the member whose answers to subscribe to.
   * @param cb Callback function to handle received clarifications.
   */
  async subscribeForMemberAnswer(
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/members/${memberId}/clarifications:answer`,
      cb,
    );
  }

  /**
   * Subscribe to clarification deletion events for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle deleted clarification IDs.
   */
  async subscribeForContestDeleted(
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/clarifications:deleted`,
      cb,
    );
  }
}
