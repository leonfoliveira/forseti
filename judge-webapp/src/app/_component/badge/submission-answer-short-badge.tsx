import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { Badge } from "@/app/_component/badge/badge";
import React from "react";
import { cls } from "@/app/_util/cls";
import { defineMessages, FormattedMessage } from "react-intl";
import { globalMessages } from "@/i18n/global";

const messages = defineMessages({
  text: {
    id: "app._component.badge.submission-answer-short-badge.text",
    defaultMessage: "{answer} x{amount}",
  },
});

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
  const text = (
    <FormattedMessage
      {...messages.text}
      values={{
        answer: (
          <FormattedMessage {...globalMessages.submissionAnswerShort[answer]} />
        ),
        amount,
      }}
    />
  );

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
