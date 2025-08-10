import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [SubmissionAnswer.NO_ANSWER]: {
    id: "_component.format.formatted-submission-answer-short.no_answer",
    defaultMessage: "",
  },
  [SubmissionAnswer.ACCEPTED]: {
    id: "_component.format.formatted-submission-answer-short.accepted",
    defaultMessage: "AC",
  },
  [SubmissionAnswer.WRONG_ANSWER]: {
    id: "_component.format.formatted-submission-answer-short.wrong_answer",
    defaultMessage: "WA",
  },
  [SubmissionAnswer.COMPILATION_ERROR]: {
    id: "_component.format.formatted-submission-answer-short.compilation_error",
    defaultMessage: "CE",
  },
  [SubmissionAnswer.RUNTIME_ERROR]: {
    id: "_component.format.formatted-submission-answer-short.runtime_error",
    defaultMessage: "RE",
  },
  [SubmissionAnswer.TIME_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer-short.time_limit_exceeded",
    defaultMessage: "TLE",
  },
  [SubmissionAnswer.MEMORY_LIMIT_EXCEEDED]: {
    id: "_component.format.formatted-submission-answer-short.memory_limit_exceeded",
    defaultMessage: "MLE",
  },
});

export function FormattedSubmissionAnswerShort({
  answer,
}: {
  answer: SubmissionAnswer;
}) {
  return <FormattedMessage {...messages[answer]} />;
}
