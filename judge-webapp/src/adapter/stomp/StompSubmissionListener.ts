import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";

export class StompSubmissionListener implements SubmissionListener {
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/submissions`, cb);
  }

  async subscribeForContestFull(
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/submissions/full`, cb);
  }

  async subscribeForMember(
    client: ListenerClient,
    memberId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/members/${memberId}/submissions`, cb);
  }
}
