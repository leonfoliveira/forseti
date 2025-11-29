import { DateTimeFormatOptions } from "next-intl";

import { useIntl } from "@/app/_lib/util/intl-hook";

type Props = {
  timestamp: string;
  options?: DateTimeFormatOptions;
};

export function FormattedDateTime({ timestamp, options }: Props) {
  const date = new Date(timestamp);
  const intl = useIntl();

  return intl.formatDateTime(date, {
    ...{
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      ...options,
    },
  });
}
