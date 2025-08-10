import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [SubmissionAnswer.NO_ANSWER]: {
    id: "_component.format.formatted-submission-answer.no_answer",
    defaultMessage: "Judging",
  },
  [SubmissionAnswer.ACCEPTED]: {
    id: "_component.format.formatted-submission-answer.accepted",
    defaultMessage: "Accepted",
  },
  [SubmissionAnswer.WRONG_ANSWER]: {
    id: "_component.format.formatted-submission-answer.wrong_answer",
    defaultMessage: "Wrong Answer",
  },
  [SubmissionAnswer.COMPILATION_ERROR]: {
    id: "_component.format.formatted-submission-answer.compilation_error",
    defaultMessage: "Compilation Error",
  },
  [SubmissionAnswer.RUNTIME_ERROR]: {
    id: "_component.format.formatted-submission-answer.runtime_error",
    defaultMessage: "Runtime Error",
  },
  [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer.time_limit_exceeded",
    defaultMessage: "Time Limit Exceeded",
  },
  [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer.memory_limit_exceeded",
    defaultMessage: "Memory Limit Exceeded",
  },
});

export function FormattedSubmissionAnswer({
  answer,
}: {
  answer: SubmissionAnswer;
}) {
  return <FormattedMessage {...messages[answer]} />;
}
