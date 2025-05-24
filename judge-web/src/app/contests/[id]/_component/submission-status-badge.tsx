import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { formatSubmissionStatus } from "@/app/_util/contest-utils";
import { Badge } from "@/app/_component/badge";
import React from "react";

type Props = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: Props) {
  const text = formatSubmissionStatus(status);
  switch (status) {
    case SubmissionStatus.JUDGING:
      return <span>text</span>;
    case SubmissionStatus.ACCEPTED:
      return <Badge variant="success">{text}</Badge>;
    case SubmissionStatus.TIME_LIMIT_EXCEEDED:
      return <Badge variant="primary">{text}</Badge>;
    case SubmissionStatus.RUNTIME_ERROR:
    case SubmissionStatus.COMPILATION_ERROR:
      return <Badge variant="warning">{text}</Badge>;
    default:
      return <Badge variant="danger">{text}</Badge>;
  }
}
