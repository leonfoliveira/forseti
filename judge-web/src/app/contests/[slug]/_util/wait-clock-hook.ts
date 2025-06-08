import { useEffect, useRef } from "react";
import { formatDifference } from "@/app/_util/date-utils";

export function useWaitClock(target: Date, onZero?: () => void) {
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (target) {
      const interval = setInterval(() => {
        if (clockRef.current) {
          const diff = Math.max(0, target.getTime() - new Date().getTime());
          clockRef.current.textContent = formatDifference(diff);

          if (diff / 1000 / 60 < 20) {
            clockRef.current.classList.add("text-error");
          }

          if (diff === 0) {
            onZero?.();
            clearInterval(interval);
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [target]);

  return clockRef;
}
