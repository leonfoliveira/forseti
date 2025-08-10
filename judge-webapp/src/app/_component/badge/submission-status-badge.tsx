import { Badge } from "@/app/_component/badge/badge";
import React from "react";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { FormattedSubmissionStatus } from "@/app/_component/format/formatted-submission-status";

type Props = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: Props) {
  const text = <FormattedSubmissionStatus status={status} />;

  switch (status) {
    case SubmissionStatus.JUDGED:
      return <Badge className="badge-success">{text}</Badge>;
    case SubmissionStatus.FAILED:
      return <Badge className="badge-error">{text}</Badge>;
    default:
      return <Badge className="badge-neutral">{text}</Badge>;
  }
}
