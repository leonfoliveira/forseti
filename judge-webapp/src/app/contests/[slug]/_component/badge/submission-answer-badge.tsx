import { Badge } from "@/app/_component/badge/badge";
import React from "react";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";

type Props = {
  answer: SubmissionAnswer;
};

export function SubmissionAnswerBadge({ answer }: Props) {
  const { formatSubmissionAnswer } = useContestFormatter();
  const text = formatSubmissionAnswer(answer);

  switch (answer) {
    case SubmissionAnswer.NO_ANSWER:
      return <Badge className="badge-neutral">{text}</Badge>;
    case SubmissionAnswer.ACCEPTED:
      return <Badge className="badge-success">{text}</Badge>;
    case SubmissionAnswer.WRONG_ANSWER:
      return <Badge className="badge-error">{text}</Badge>;
    case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
    case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED:
      return <Badge className="badge-info">{text}</Badge>;
    case SubmissionAnswer.RUNTIME_ERROR:
    case SubmissionAnswer.COMPILATION_ERROR:
      return <Badge className="badge-warning">{text}</Badge>;
  }
}
