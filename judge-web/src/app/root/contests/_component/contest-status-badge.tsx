import { ContestStatus, formatStatus } from "@/app/_util/contest-utils";
import React from "react";
import { Badge } from "@/app/_component/badge";
import { ContestOutputDTO } from "@/core/service/dto/output/ContestOutputDTO";
import { ContestSummaryOutputDTO } from "@/core/service/dto/output/ContestSummaryOutputDTO";

type Props = {
  contest: ContestOutputDTO | ContestSummaryOutputDTO;
};

export function ContestStatusBadge({ contest }: Props) {
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
