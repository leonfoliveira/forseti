import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
import { StompClient } from "@/adapter/stomp/StompClient";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export class StompSubmissionListener implements SubmissionListener {
  constructor(private readonly stompConnector: StompConnector) {}

  async subscribeForContest(
    contestId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/contests/${contestId}/submissions`, cb);
    return client;
  }

  async subscribeForMember(
    memberId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/members/${memberId}/submissions`, cb);
    return client;
  }

  async subscribeForFail(
    contestId: number,
    cb: (submission: SubmissionPrivateResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/contests/${contestId}/submissions/fail`, cb);
    return client;
  }

  async unsubscribe(listener: ListenerClient): Promise<void> {
    await listener.unsubscribe();
  }
}
