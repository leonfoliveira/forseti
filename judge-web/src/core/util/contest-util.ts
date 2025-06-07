import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { WithStatus } from "@/core/service/dto/output/ContestWithStatus";

export class ContestUtil {
  static addStatus<TContest extends { startAt: string; endAt: string }>(
    contest: TContest,
  ): WithStatus<TContest> {
    const now = new Date();
    const startAt = new Date(contest.startAt);
    const endAt = new Date(contest.endAt);
    let status: ContestStatus;

    if (now < startAt) {
      status = ContestStatus.NOT_STARTED;
    } else if (now >= startAt && now <= endAt) {
      status = ContestStatus.IN_PROGRESS;
    } else {
      status = ContestStatus.ENDED;
    }

    return {
      ...contest,
      status,
    };
  }
}
