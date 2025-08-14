import { useEffect, useRef, useState } from "react";

import { FormattedDuration } from "@/lib/component/format/formatted-duration";
import { cls } from "@/lib/util/cls";

type Props = {
  to: Date;
  onZero?: () => void;
  className?: string;
};

export function CountdownClock({ to, onZero, className }: Props) {
  const [ms, setMs] = useState(to.getTime() - Date.now());
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      const diff = Math.max(0, to.getTime() - new Date().getTime());
      if (diff === 0) {
        onZero?.();
        if (interval.current) clearInterval(interval.current);
      }
      setMs(diff);
    }, 1000);

    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [to]);

  return (
    <span className={cls(ms / 1000 / 60 < 20 && "text-error", className)}>
      <FormattedDuration ms={ms} />
    </span>
  );
}
