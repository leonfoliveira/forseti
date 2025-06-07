import { useTranslations } from "next-intl";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

export function useContestFormatter() {
  const t = useTranslations("_util.contest-formatter-hook");

  function formatStatus(status: ContestStatus) {
    return t(`contest-status.${status}`);
  }

  function formatLanguage(languages: Language) {
    return t(`language.${languages}`);
  }

  function formatSubmissionStatus(status: SubmissionStatus) {
    return t(`submission-status.${status}`);
  }

  function formatSubmissionAnswer(status: SubmissionAnswer) {
    return t(`submission-answer.${status}`);
  }

  return {
    formatStatus,
    formatLanguage,
    formatSubmissionStatus,
    formatSubmissionAnswer,
  };
}
