import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { SubmissionListener } from "@/core/port/driven/listener/SubmissionListener";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

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
    cb: (submission: SubmissionResponseDTO) => void,
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
  async subscribeForContestWithCodeAndExecutions(
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/submissions:with-code-and-executions`,
      cb,
    );
  }

  /**
   * Subscribe to full submission updates for the children of a member in a contest using STOMP websocket protocol.
   *
   * @param client The STOMP client used for subscribing.
   * @param contestId ID of the contest to subscribe to.
   * @param memberId ID of the member whose children submissions to subscribe to.
   * @param cb Callback function to handle received full submissions.
   */
  async subscribeForMemberWithCode(
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (submission: SubmissionWithCodeResponseDTO) => void,
  ): Promise<void> {
    await client.subscribe(
      `/topic/contests/${contestId}/members/${memberId}/submissions:with-code`,
      cb,
    );
  }
}
