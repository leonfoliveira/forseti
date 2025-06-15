import { Badge } from "@/app/_component/badge";
import React from "react";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";

type Props = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: Props) {
  const { formatSubmissionStatus } = useContestFormatter();
  const text = formatSubmissionStatus(status);

  switch (status) {
    case SubmissionStatus.JUDGED:
      return <Badge className="badge-success">{text}</Badge>;
    case SubmissionStatus.FAILED:
      return <Badge className="badge-error">{text}</Badge>;
    default:
      return <Badge className="badge-neutral">{text}</Badge>;
  }
}
