import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { globalMessages } from "@/i18n/global";

type Props = React.ComponentProps<typeof Badge> & {
  answer: SubmissionAnswer;
};

/**
 * Displays a badge component styled according to the submission answer status.
 */
export function SubmissionAnswerBadge({ answer, ...props }: Props) {
  const text = (
    <FormattedMessage {...globalMessages.submissionAnswer[answer]} />
  );

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
