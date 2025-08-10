import { Badge } from "@/app/_component/badge/badge";
import React from "react";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { FormattedSubmissionAnswer } from "@/app/_component/format/formatted-submission-answer";

type Props = {
  answer: SubmissionAnswer;
};

export function SubmissionAnswerBadge({ answer }: Props) {
  const text = <FormattedSubmissionAnswer answer={answer} />;

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
