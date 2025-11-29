import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";

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
    cb: (submission: SubmissionPublicResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to full submission updates for a contest.
   *
   * @param client The listener client used to subscribe to the submissions.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming full submissions.
   */
  subscribeForContestFull: (
    client: ListenerClient,
    contestId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to full submission updates for a member in a contest.
   *
   * @param client The listener client used to subscribe to the submissions.
   * @param contestId ID of the contest
   * @param memberId ID of the member
   * @param cb Callback function to handle incoming full submissions.
   */
  subscribeForMemberFull: (
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (submission: SubmissionFullResponseDTO) => void,
  ) => Promise<void>;
}
