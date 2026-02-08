import React from "react";

import { Chip, ChipProps } from "@/app/_lib/component/base/display/chip";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { globalMessages } from "@/i18n/global";

type Props = ChipProps & {
  answer: SubmissionAnswer;
};

/**
 * Displays a chip component styled according to the submission answer status.
 */
export function SubmissionAnswerChip({ answer, ...props }: Props) {
  const text = (
    <FormattedMessage {...globalMessages.submissionAnswer[answer]} />
  );

  switch (answer) {
    case SubmissionAnswer.NO_ANSWER:
      return (
        <Chip data-testid="chip-no-answer" {...props} color="default">
          {text}
        </Chip>
      );
    case SubmissionAnswer.ACCEPTED:
      return (
        <Chip data-testid="chip-accepted" {...props} color="success">
          {text}
        </Chip>
      );
    case SubmissionAnswer.WRONG_ANSWER:
      return (
        <Chip data-testid="chip-wrong-answer" {...props} color="danger">
          {text}
        </Chip>
      );
    case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
    case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED:
      return (
        <Chip data-testid="chip-limit-exceeded" {...props} color="primary">
          {text}
        </Chip>
      );
    case SubmissionAnswer.RUNTIME_ERROR:
    case SubmissionAnswer.COMPILATION_ERROR:
      return (
        <Chip data-testid="chip-error" {...props} color="warning">
          {text}
        </Chip>
      );
  }
}
