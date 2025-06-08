import React from "react";
import { Badge } from "@/app/_component/badge";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";

type Props<TContest> = {
  contest: TContest;
};

export function ContestStatusBadge<TContest extends { status: ContestStatus }>({
  contest,
}: Props<TContest>) {
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
