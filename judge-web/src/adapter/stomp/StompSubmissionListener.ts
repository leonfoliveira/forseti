import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { StompClient } from "@/adapter/stomp/StompClient";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

export class StompSubmissionListener implements SubmissionListener {
  constructor(private readonly stompClient: StompClient) {}

  subscribeForContest(
    contestId: number,
    cb: (submission: SubmissionEmmitDTO) => void,
  ): Promise<string> {
    return this.stompClient.subscribe(`/contests/${contestId}/submissions`, cb);
  }

  subscribeForMember(
    memberId: number,
    cb: (submission: SubmissionEmmitDTO) => void,
  ): Promise<string> {
    return this.stompClient.subscribe(`/members/${memberId}/submissions`, cb);
  }

  unregister(id: string): void {
    this.stompClient.unsubscribe(id);
  }
}
