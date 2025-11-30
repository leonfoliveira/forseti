import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

export class ContestUtil {
  /**
   * Get the current status of a contest based on its start and end dates.
   *
   * @param contest An object containing `startAt` and `endAt` date strings.
   * @returns The current status of the contest as a `ContestStatus` enum value.
   */
  static getStatus<TContest extends { startAt: string; endAt: string }>(
    contest: TContest,
  ): ContestStatus {
    const now = new Date();
    const startAt = new Date(contest.startAt);
    const endAt = new Date(contest.endAt);

    if (now < startAt) {
      return ContestStatus.NOT_STARTED;
    } else if (now >= startAt && now <= endAt) {
      return ContestStatus.IN_PROGRESS;
    } else {
      return ContestStatus.ENDED;
    }
  }
}
