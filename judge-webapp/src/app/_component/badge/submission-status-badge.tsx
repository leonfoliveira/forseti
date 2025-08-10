import { Badge } from "@/app/_component/badge/badge";
import React from "react";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { FormattedMessage } from "react-intl";
import { globalMessages } from "@/i18n/global";

type Props = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: Props) {
  const text = (
    <FormattedMessage {...globalMessages.submissionStatus[status]} />
  );

  switch (status) {
    case SubmissionStatus.JUDGED:
      return <Badge className="badge-success">{text}</Badge>;
    case SubmissionStatus.FAILED:
      return <Badge className="badge-error">{text}</Badge>;
    default:
      return <Badge className="badge-neutral">{text}</Badge>;
  }
}
