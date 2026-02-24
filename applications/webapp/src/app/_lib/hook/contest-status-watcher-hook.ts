import { useEffect, useState } from "react";

import { useAppSelector } from "@/app/_store/store";
import { ContestUtil } from "@/core/application/util/ContestUtil";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

/**
 * Custom hook to watch the current contest status.
 * It automatically updates the status based on contest metadata changes and startAt/endAt times.
 */
export function useContestStatusWatcher() {
  const contest = useAppSelector((state) => state.contest);
  const [status, setStatus] = useState<ContestStatus>(
    ContestUtil.getStatus(contest),
  );

  useEffect(() => {
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
