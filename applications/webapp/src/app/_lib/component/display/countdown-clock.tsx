"use client";

import { HourglassIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { FormattedDuration } from "@/app/_lib/component/i18n/formatted-duration";
import { cn } from "@/app/_lib/util/cn";

type Props = React.HtmlHTMLAttributes<HTMLSpanElement> & {
  to: Date;
};

/**
 * A countdown clock component that counts down to a specified date and time.
 * On reaching zero, it can trigger an optional callback function.
 */
export function CountdownClock({ to, ...props }: Props) {
  const [ms, setMs] = useState<number | undefined>();
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMs(Math.max(0, to.getTime() - new Date().getTime()));

    interval.current = setInterval(() => {
      const diff = to.getTime() - new Date().getTime();
      if (diff === 0) {
        if (interval.current) clearInterval(interval.current);
      }
      setMs(Math.max(0, diff));
    }, 1000);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [to]);

  const isAboutToEnd = ms !== undefined && ms / 1000 / 60 < 20;

  return ms !== undefined ? (
    <>
      <div
        data-testid="clock"
        {...props}
        className={cn(
          "flex items-center gap-1",
          isAboutToEnd && "text-destructive",
          props.className,
        )}
      >
        <HourglassIcon
          size={16}
          data-icon="inline-start"
          className={cn("inline", isAboutToEnd && "text-destructive")}
        />
        <FormattedDuration ms={ms} />
      </div>
    </>
  ) : (
    <span />
  );
}
