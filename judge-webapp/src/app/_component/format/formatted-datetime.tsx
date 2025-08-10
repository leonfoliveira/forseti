import { FormattedDate } from "react-intl";

type Props = {
  timestamp: string;
  options?: Intl.DateTimeFormatOptions;
};

export function FormattedDateTime({ timestamp, options }: Props) {
  const date = new Date(timestamp);

  return (
    <FormattedDate
      value={date}
      {...{
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        ...options,
      }}
    />
  );
}
