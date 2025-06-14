import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { useTranslations } from "next-intl";
import { Badge } from "@/app/_component/badge";
import React from "react";

type Props = {
  answer: SubmissionAnswer;
  amount: number;
};

export function SubmissionAnswerShortBadge({ answer, amount }: Props) {
  const t = useTranslations(
    "contests.[slug]._component.submission-answer-short-badge",
  );

  switch (answer) {
    case SubmissionAnswer.ACCEPTED:
      return <Badge className="badge-success">{t(answer, { amount })}</Badge>;
    case SubmissionAnswer.WRONG_ANSWER:
      return <Badge className="badge-error">{t(answer, { amount })}</Badge>;
    case SubmissionAnswer.COMPILATION_ERROR:
    case SubmissionAnswer.RUNTIME_ERROR:
      return <Badge className="badge-warning">{t(answer, { amount })}</Badge>;
    case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
    case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED:
      return <Badge className="badge-info">{t(answer, { amount })}</Badge>;
  }
}
