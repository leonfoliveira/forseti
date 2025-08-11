import React from "react";
import { FormattedMessage } from "react-intl";

import { Badge } from "@/app/_component/badge/badge";
import { cls } from "@/app/_util/cls";
import { useContestStatusWatcher } from "@/app/_util/contest-status-watcher";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { globalMessages } from "@/i18n/global";

type Props<TContest> = {
  contest: TContest;
  className?: string;
};

export function ContestStatusBadge<
  TContest extends { startAt: string; endAt: string },
>({ contest, className }: Props<TContest>) {
  const status = useContestStatusWatcher(contest);
  const text = status && (
    <FormattedMessage {...globalMessages.contestStatus[status]} />
  );

  switch (status) {
    case ContestStatus.IN_PROGRESS:
      return <Badge className={cls("badge-success", className)}>{text}</Badge>;
    case ContestStatus.ENDED:
      return <Badge className={cls("badge-warning", className)}>{text}</Badge>;
    case ContestStatus.NOT_STARTED:
      return <Badge className={cls("badge-neutral", className)}>{text}</Badge>;
    default:
      return null;
  }
}
