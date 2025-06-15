import React from "react";
import { Badge } from "@/app/_component/badge";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { cls } from "@/app/_util/cls";
import { useContestStatusWatcher } from "@/app/_util/contest-status-watcher";

type Props<TContest> = {
  contest: TContest;
  className?: string;
};

export function ContestStatusBadge<
  TContest extends { startAt: string; endAt: string },
>({ contest, className }: Props<TContest>) {
  const { formatStatus } = useContestFormatter();
  const status = useContestStatusWatcher(contest);

  switch (status) {
    case ContestStatus.IN_PROGRESS:
      return (
        <Badge className={cls("badge-success", className)}>
          {formatStatus(status)}
        </Badge>
      );
    case ContestStatus.ENDED:
      return (
        <Badge className={cls("badge-warning", className)}>
          {formatStatus(status)}
        </Badge>
      );
    case ContestStatus.NOT_STARTED:
      return (
        <Badge className={cls("badge-neutral", className)}>
          {formatStatus(status)}
        </Badge>
      );
    default:
      return null;
  }
}
