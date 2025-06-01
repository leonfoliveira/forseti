import { useTranslations } from "next-intl";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

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

  return {
    formatStatus,
    formatLanguage,
    formatSubmissionStatus,
  };
}
