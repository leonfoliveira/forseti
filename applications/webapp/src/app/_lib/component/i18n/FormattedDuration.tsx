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

  if (days === 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
