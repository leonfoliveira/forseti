import { useEffect, useRef } from "react";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  duration: {
    id: "app.contests.[slug]._util.wait-clock-hook.duration",
    defaultMessage: "{hours}:{minutes}:{seconds}",
  },
  durationWithDays: {
    id: "app.contests.[slug]._util.wait-clock-hook.durationWithDays",
    defaultMessage: "{days}d {hours}:{minutes}:{seconds}",
  },
});

/**
 * Hook to create a countdown clock that updates every second.
 */
export function useWaitClock(target?: Date, onZero?: () => void) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const intl = useIntl();

  function format(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (it: number) => String(it).padStart(2, "0");

    return intl.formatMessage(
      days > 0 ? messages.durationWithDays : messages.duration,
      {
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      },
    );
  }

  useEffect(() => {
    if (!!intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (target) {
      const interval = setInterval(() => {
        if (clockRef.current) {
          const diff = Math.max(0, target.getTime() - new Date().getTime());
          clockRef.current.textContent = format(diff);

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
