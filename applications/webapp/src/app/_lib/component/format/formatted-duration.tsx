import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  duration: {
    id: "app._lib.component.format.formatted-duration.duration",
    defaultMessage: "{hours}:{minutes}:{seconds}",
  },
  durationWithDays: {
    id: "app._lib.component.format.formatted-duration.duration-with-days",
    defaultMessage: "{days}d {hours}:{minutes}:{seconds}",
  },
});

type Props = {
  ms: number;
};

/**
 * Formats a duration given in milliseconds into a human-readable string.
 * If the duration includes days, it will be displayed in the format "Xd HH:MM:SS",
 * otherwise in the format "HH:MM:SS".
 */
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
        days: days,
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      }}
    />
  );
}
