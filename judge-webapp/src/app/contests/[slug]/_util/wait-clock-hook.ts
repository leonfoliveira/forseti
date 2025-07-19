import { useEffect, useRef } from "react";
import { DateUtils } from "@/app/_util/date-utils";

/**
 * Hook to create a countdown clock that updates every second.
 */
export function useWaitClock(target?: Date, onZero?: () => void) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!!intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (target) {
      const interval = setInterval(() => {
        if (clockRef.current) {
          const diff = Math.max(0, target.getTime() - new Date().getTime());
          clockRef.current.textContent = DateUtils.formatDifference(diff);

          if (diff / 1000 / 60 < 20) {
            clockRef.current.classList.add("text-error");
          }

          if (diff === 0) {
            onZero?.();
            clearInterval(interval);
          }
        }
      }, 1000);

      intervalRef.current = interval;
    }

    return () => {
      if (!!intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [target]);

  return clockRef;
}
