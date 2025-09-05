import React, { useEffect, useRef, useState } from "react";

import { FormattedDuration } from "@/lib/component/format/formatted-duration";
import { cls } from "@/lib/util/cls";

type Props = React.HtmlHTMLAttributes<HTMLSpanElement> & {
  to: Date;
  onZero?: () => void;
};

export function CountdownClock({ to, onZero, ...props }: Props) {
  const [ms, setMs] = useState<number>(
    Math.max(0, to.getTime() - new Date().getTime()),
  );
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      const diff = to.getTime() - new Date().getTime();
      if (diff === 0) {
        onZero?.();
        if (interval.current) clearInterval(interval.current);
      }
      setMs(Math.max(0, diff));
    }, 1000);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [to]);

  return (
    <span
      data-testid="clock"
      {...props}
      className={cls(ms / 1000 / 60 < 20 && "text-error", props.className)}
    >
      <FormattedDuration ms={ms} />
    </span>
  );
}
