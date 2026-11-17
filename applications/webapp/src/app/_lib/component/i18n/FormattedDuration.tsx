import { useTranslation } from "react-i18next";

type Props = {
  ms: number;
  options?: Intl.DurationFormatOptions;
};

/**
 * Formats a duration given in milliseconds into a human-readable string.
 */
export function FormattedDuration({ ms, options }: Props) {
  const { i18n } = useTranslation();

  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const duration = {
    days: Math.floor(totalSeconds / (3600 * 24)),
    hours: Math.floor((totalSeconds % (3600 * 24)) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  return new Intl.DurationFormat(i18n.language, {
    style: "digital",
    days: "narrow",
    hours: "2-digit",
    minutes: "2-digit",
    seconds: "2-digit",
    ...options,
  }).format(duration);
}
