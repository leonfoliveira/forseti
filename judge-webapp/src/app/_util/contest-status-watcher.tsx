import { useEffect, useState } from "react";

import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestUtil } from "@/core/util/contest-util";

export function useContestStatusWatcherBatch<
  TContest extends { id: string; startAt: string; endAt: string },
>(contests: TContest[]) {
  const [statuses, setStatuses] = useState<Record<string, ContestStatus>>({});

  useEffect(() => {
    const now = Date.now();
    const newStatuses: Record<string, ContestStatus> = {};

    const timeOuts: NodeJS.Timeout[] = [];

    contests.forEach((contest) => {
      newStatuses[contest.id] = ContestUtil.getStatus(contest);

      const start = new Date(contest.startAt).getTime();
      const end = new Date(contest.endAt).getTime();

      if (start > now) {
        timeOuts.push(
          setTimeout(() => {
            newStatuses[contest.id] = ContestUtil.getStatus(contest);
            setStatuses({ ...newStatuses });
          }, start - now),
        );
      }

      if (end > now) {
        timeOuts.push(
          setTimeout(() => {
            newStatuses[contest.id] = ContestUtil.getStatus(contest);
            setStatuses({ ...newStatuses });
          }, end - now),
        );
      }
    });

    setStatuses(newStatuses);

    return () => {
      timeOuts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [contests]);

  return statuses;
}

export function useContestStatusWatcher<
  TContest extends { startAt: string; endAt: string },
>(contest: TContest | undefined) {
  const [status, setStatus] = useState<ContestStatus | undefined>();

  useEffect(() => {
    if (!contest) {
      return;
    }

    setStatus(ContestUtil.getStatus(contest));

    const now = Date.now();
    const start = new Date(contest.startAt).getTime();
    const end = new Date(contest.endAt).getTime();

    let startTimeout: NodeJS.Timeout | null = null;
    let endTimeout: NodeJS.Timeout | null = null;

    if (start > now) {
      startTimeout = setTimeout(() => {
        setStatus(ContestUtil.getStatus(contest));
      }, start - now);
    }

    if (end > now) {
      endTimeout = setTimeout(() => {
        setStatus(ContestUtil.getStatus(contest));
      }, end - now);
    }

    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      if (endTimeout) clearTimeout(endTimeout);
    };
  }, [contest]);

  return status;
}
