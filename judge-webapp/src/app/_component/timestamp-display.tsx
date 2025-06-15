import { DateTimeFormatOptions, useFormatter } from "next-intl";

type Props = {
  timestamp: string;
  options?: DateTimeFormatOptions;
};

export function TimestampDisplay({ timestamp, options }: Props) {
  const format = useFormatter();
  const date = new Date(timestamp);

  return format.dateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...options,
  });
}
