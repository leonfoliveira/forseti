import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { Badge } from "@/app/_component/badge";
import React from "react";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { cls } from "@/app/_util/cls";

type Props = {
  className?: string;
  answer: SubmissionAnswer;
  amount: number;
};

export function SubmissionAnswerShortBadge({
  className,
  answer,
  amount,
}: Props) {
  const { formatSubmissionAnswerShort } = useContestFormatter();

  const text = `${formatSubmissionAnswerShort(answer)} x${amount}`;

  switch (answer) {
    case SubmissionAnswer.ACCEPTED:
      return <Badge className={cls(className, "badge-success")}>{text}</Badge>;
    case SubmissionAnswer.WRONG_ANSWER:
      return <Badge className={cls(className, "badge-error")}>{text}</Badge>;
    case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
    case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED:
      return <Badge className={cls(className, "badge-info")}>{text}</Badge>;
    case SubmissionAnswer.COMPILATION_ERROR:
    case SubmissionAnswer.RUNTIME_ERROR:
      return <Badge className={cls(className, "badge-warning")}>{text}</Badge>;
  }
}
