import { ContestShortResponseDTO } from "@/core/repository/dto/response/ContestShortResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";
import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";

export enum ContestStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  ENDED = "ENDED",
}

export function getContestStatus(
  contest: ContestShortResponseDTO | ContestResponseDTO,
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

export function formatStatus(status: ContestStatus) {
  switch (status) {
    case ContestStatus.NOT_STARTED:
      return "Not Started";
    case ContestStatus.IN_PROGRESS:
      return "In Progress";
    case ContestStatus.ENDED:
      return "Ended";
  }
}

export function formatLanguage(languages: Language) {
  switch (languages) {
    case Language.PYTHON_3_13_3:
      return "Python 3.13.3";
  }
}
