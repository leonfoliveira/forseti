import { ContestResponseDTO } from "@/core/repository/dto/response/ContestResponseDTO";
import { Language } from "@/core/domain/enumerate/Language";

export enum ContestStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  ENDED = "ENDED",
}

export function getContestStatus(contest: ContestResponseDTO) {
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

export function formatLanguage(languages: Language) {
  switch (languages) {
    case Language.PYTHON_3_13_3:
      return "Python 3.13.3";
  }
}
