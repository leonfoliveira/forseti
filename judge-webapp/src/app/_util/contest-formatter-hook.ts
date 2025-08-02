import { useTranslations } from "next-intl";
import { Language } from "@/core/domain/enumerate/Language";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { MemberType } from "@/core/domain/enumerate/MemberType";

/**
 * Utility hook to format contest-related data using translations.
 */
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

  function formatSubmissionAnswer(answer: SubmissionAnswer) {
    return t(`submission-answer.${answer}`);
  }

  function formatSubmissionAnswerShort(answer: SubmissionAnswer) {
    return t(`submission-answer-short.${answer}`);
  }

  function formatMemberType(memberType: MemberType) {
    return t(`member-type.${memberType}`);
  }

  return {
    formatStatus,
    formatLanguage,
    formatSubmissionStatus,
    formatSubmissionAnswer,
    formatSubmissionAnswerShort,
    formatMemberType,
  };
}
