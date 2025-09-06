import { useEffect, useState } from "react";

import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { ContestUtil } from "@/core/util/contest-util";
import { useAppSelector } from "@/store/store";

export function useContestStatusWatcher() {
  const contestMetadata = useAppSelector((state) => state.contestMetadata);
  const [status, setStatus] = useState<ContestStatus>(
    ContestUtil.getStatus(contestMetadata),
  );

  useEffect(() => {
    setStatus(ContestUtil.getStatus(contestMetadata));

    const now = Date.now();
    const start = new Date(contestMetadata.startAt).getTime();
    const end = new Date(contestMetadata.endAt).getTime();

    let startTimeout: NodeJS.Timeout | null = null;
    let endTimeout: NodeJS.Timeout | null = null;

    if (start > now) {
      startTimeout = setTimeout(() => {
        setStatus(ContestUtil.getStatus(contestMetadata));
      }, start - now);
    }

    if (end > now) {
      endTimeout = setTimeout(() => {
        setStatus(ContestUtil.getStatus(contestMetadata));
      }, end - now);
    }

    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      if (endTimeout) clearTimeout(endTimeout);
    };
  }, [contestMetadata]);

  return status;
}
