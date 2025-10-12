import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

export class ContestUtil {
  static getStatus<TContest extends { startAt: string; endAt: string }>(
    contest: TContest,
  ) {
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
