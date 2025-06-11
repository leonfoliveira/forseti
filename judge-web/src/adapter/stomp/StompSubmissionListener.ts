import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { StompConnector } from "@/adapter/stomp/StompConnector";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { StompClient } from "@/adapter/stomp/StompClient";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";

export class StompSubmissionListener implements SubmissionListener {
  constructor(private readonly stompConnector: StompConnector) {}

  async subscribeForContest(
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/contests/${contestId}/submissions`, cb);
    return client;
  }

  async subscribeForContestFull(
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ): Promise<ListenerClient> {
    const client = new StompClient(this.stompConnector);
    await client.subscribe(`/topic/contests/${contestId}/submissions/full`, cb);
    return client;
  }

  async unsubscribe(listener: ListenerClient): Promise<void> {
    await listener.unsubscribe();
  }
}
