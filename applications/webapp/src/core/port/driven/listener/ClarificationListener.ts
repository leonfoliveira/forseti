import { ListenerClient } from "@/core/port/driven/listener/ListenerClient";
import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

export interface ClarificationListener {
  /**
   * Subscribe to clarification updates for a contest.
   *
   * @param client The listener client used to subscribe to the clarifications.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming clarifications.
   */
  subscribeForContest: (
    client: ListenerClient,
    contestId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to answers for clarifications of member for a contest.
   *
   * @param client The listener client used to subscribe to the clarifications.
   * @param contestId ID of the contest
   * @param memberId ID of the member
   * @param cb Callback function to handle incoming clarifications.
   */
  subscribeForMemberChildren: (
    client: ListenerClient,
    contestId: string,
    memberId: string,
    cb: (clarification: ClarificationResponseDTO) => void,
  ) => Promise<void>;

  /**
   * Subscribe to deleted clarifications for a contest.
   *
   * @param client The listener client used to subscribe to the clarifications.
   * @param contestId ID of the contest
   * @param cb Callback function to handle incoming deleted clarification IDs.
   */
  subscribeForContestDeleted: (
    client: ListenerClient,
    contestId: string,
    cb: (payload: { id: string }) => void,
  ) => Promise<void>;
}
