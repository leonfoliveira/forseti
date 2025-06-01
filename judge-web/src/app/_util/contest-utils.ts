import { ContestSummaryResponseDTO } from "@/core/repository/dto/response/ContestSummaryResponseDTO";
import { ContestPrivateResponseDTO } from "@/core/repository/dto/response/ContestPrivateResponseDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

export function getContestStatus(
  contest: ContestSummaryResponseDTO | ContestPrivateResponseDTO,
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
