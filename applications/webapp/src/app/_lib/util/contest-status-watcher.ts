import { useEffect, useState } from "react";

import { useAppSelector } from "@/app/_store/store";
import { ContestUtil } from "@/core/application/util/contest-util";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";

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
