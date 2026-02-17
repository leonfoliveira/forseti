import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { SubmissionListener } from "@/core/port/driven/listener/SubmissionListener";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

export class StompSubmissionListener implements SubmissionListener {
  /**
   * Subscribe to submission updates for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle received submissions.
   */
  async subscribeForContest(
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/submissions`, cb);
  }

  /**
   * Subscribe to full submission updates for a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param cb Callback function to handle received full submissions.
   */
  async subscribeForContestFull(
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionFullWithExecutionResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(`/topic/contests/${contestId}/submissions/full`, cb);
  }

  /**
   * Subscribe to full submission updates for the children of a member in a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param memberId ID of the member whose children submissions to subscribe to.
   * @param cb Callback function to handle received full submissions.
   */
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
