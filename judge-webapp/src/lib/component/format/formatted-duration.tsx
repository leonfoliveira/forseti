import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  duration: {
    id: "lib.component.format.formatted-duration.duration",
    defaultMessage: "{hours}:{minutes}:{seconds}",
  },
  durationWithDays: {
    id: "lib.component.format.formatted-duration.duration-with-days",
    defaultMessage: "{days}d {hours}:{minutes}:{seconds}",
  },
});

type Props = {
  ms: number;
};

export function FormattedDuration({ ms }: Props) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (it: number) => String(it).padStart(2, "0");

  return (
    <FormattedMessage
      {...(days > 0 ? messages.durationWithDays : messages.duration)}
      values={{
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      }}
    />
  );
}
