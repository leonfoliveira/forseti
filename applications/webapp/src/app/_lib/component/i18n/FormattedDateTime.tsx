type Props = {
  timestamp: string;
  options?: Intl.DateTimeFormatOptions;
};

/**
 * Formats a ISO timestamp into a localized date and time string.
 */
export function FormattedDateTime({ timestamp, options }: Props) {
  const date = new Date(timestamp);
  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...options,
  });

  return formatter.format(date);
}
