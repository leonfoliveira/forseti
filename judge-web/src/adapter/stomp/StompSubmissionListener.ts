import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { StompClient } from "@/adapter/stomp/StompClient";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { CompatClient } from "@stomp/stompjs";

export class StompSubmissionListener implements SubmissionListener {
  constructor(private readonly stompClient: StompClient) {}

  async subscribeForContest(
    contestId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<CompatClient> {
    const client = await this.stompClient.connect();
    client.subscribe(`/topic/contests/${contestId}/submissions`, (message) => {
      const submission = JSON.parse(
        message.body,
      ) as SubmissionPublicResponseDTO;
      cb(submission);
    });
    return client;
  }

  async subscribeForMember(
    memberId: number,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<CompatClient> {
    const client = await this.stompClient.connect();
    client.subscribe(`/topic/members/${memberId}/submissions`, (message) => {
      const submission = JSON.parse(
        message.body,
      ) as SubmissionPublicResponseDTO;
      cb(submission);
    });
    return client;
  }

  async unsubscribe(client: CompatClient): Promise<void> {
    await this.stompClient.disconnect(client);
  }
}
