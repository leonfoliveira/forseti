import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { Badge } from "@/app/_component/badge";
import React from "react";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

type Props = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: Props) {
  const { formatSubmissionStatus } = useContestFormatter();
  const text = formatSubmissionStatus(status);

  switch (status) {
    case SubmissionStatus.JUDGING:
      return <Badge className="badge-neutral">{text}</Badge>;
    case SubmissionStatus.ACCEPTED:
      return <Badge className="badge-success">{text}</Badge>;
    case SubmissionStatus.TIME_LIMIT_EXCEEDED:
      return <Badge className="badge-info">{text}</Badge>;
    case SubmissionStatus.RUNTIME_ERROR:
    case SubmissionStatus.COMPILATION_ERROR:
      return <Badge className="badge-warning">{text}</Badge>;
    default:
      return <Badge className="badge-secondary">{text}</Badge>;
  }
}
