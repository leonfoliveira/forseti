import { useFormatter } from "next-intl";

type Props = {
  timestamp: string;
  full?: boolean;
};

export function TimestampDisplay({ timestamp, full }: Props) {
  const format = useFormatter();
  const date = new Date(timestamp);

  return format.dateTime(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    fractionalSecondDigits: full ? 3 : undefined,
  });
}
