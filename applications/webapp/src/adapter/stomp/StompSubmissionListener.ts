import { ListenerClient } from "@/core/domain/model/ListenerClient";
import { SubmissionListener } from "@/core/listener/SubmissionListener";
import { SubmissionFullResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/driven/repository/dto/response/submission/SubmissionPublicResponseDTO";

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

  async subscribeForMemberFull(
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/submissions/full/members/${memberId}`,
      cb,
    );
  }
}
