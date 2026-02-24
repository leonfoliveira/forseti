import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { SubmissionResponseDTO } from "@/core/port/dto/response/submission/SubmissionResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";

export interface SubmissionListener {
  /**
   * Subscribe to submission updates for a contest.
   *
   * @param client The listener client used to subscribe to the submissions.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming submissions.
   */
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to full submission updates for a contest.
   *
   * @param client The listener client used to subscribe to the submissions.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming full submissions.
   */
  subscribeForContestWithCodeAndExecutions: (
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to full submission updates for a member in a contest.
   *
   * @param client The listener client used to subscribe to the submissions.
   * @param contestId ID of the contest
   * @param memberId ID of the member
   * @param cb Callback function to handle incoming full submissions.
   */
  subscribeForMemberWithCode: (
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (submission: SubmissionWithCodeResponseDTO) => void,
  ) => Promise<void>;
}
