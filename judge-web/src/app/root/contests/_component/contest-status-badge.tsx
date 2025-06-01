import React from "react";
import { Badge } from "@/app/_component/badge";
import { ContestOutputDTO } from "@/core/service/dto/output/ContestOutputDTO";
import { ContestSummaryOutputDTO } from "@/core/service/dto/output/ContestSummaryOutputDTO";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

type Props = {
  contest: ContestOutputDTO | ContestSummaryOutputDTO;
};

export function ContestStatusBadge({ contest }: Props) {
  const { formatStatus } = useContestFormatter();

  switch (contest.status) {
    case ContestStatus.IN_PROGRESS:
      return (
        <Badge className="badge-success">{formatStatus(contest.status)}</Badge>
      );
    case ContestStatus.ENDED:
      return (
        <Badge className="badge-warning">{formatStatus(contest.status)}</Badge>
      );
    default:
      return (
        <Badge className="badge-neutral">{formatStatus(contest.status)}</Badge>
      );
  }
}
