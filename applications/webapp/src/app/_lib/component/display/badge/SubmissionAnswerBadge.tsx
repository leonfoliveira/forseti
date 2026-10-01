import React from "react";

import { Badge } from "@/app/_lib/component/shadcn/badge";
import { SubmissionAnswer } from "@/domain/enumerate/SubmissionAnswer";

type Props = React.ComponentProps<typeof Badge> & {
  answer: SubmissionAnswer;
};

/**
 * Displays a badge component styled according to the submission answer status.
 */
export function SubmissionAnswerBadge({ answer, ...props }: Props) {
  const text = {
    [SubmissionAnswer.ACCEPTED]: "Accepted",
    [SubmissionAnswer.WRONG_ANSWER]: "Wrong Answer",
    [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: "Time Limit Exceeded",
    [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: "Memory Limit Exceeded",
    [SubmissionAnswer.RUNTIME_ERROR]: "Runtime Error",
    [SubmissionAnswer.COMPILATION_ERROR]: "Compilation Error",
  }[answer];

  switch (answer) {
    case SubmissionAnswer.ACCEPTED:
      return (
        <Badge data-testid="badge-accepted" {...props} variant="success">
          {text}
        </Badge>
      );
    case SubmissionAnswer.WRONG_ANSWER:
    case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
    case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED:
      return (
        <Badge data-testid="badge-wrong-answer" {...props} variant="error">
          {text}
        </Badge>
      );
    case SubmissionAnswer.RUNTIME_ERROR:
    case SubmissionAnswer.COMPILATION_ERROR:
      return (
        <Badge data-testid="badge-error" {...props} variant="warning">
          {text}
        </Badge>
      );
  }
}
