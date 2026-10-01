type Props = {
  value: number;
  suffix?: string;
  options?: Intl.NumberFormatOptions;
};

/**
 * Formats a number into a localized string.
 */
export function FormattedNumber({ value, suffix, options }: Props) {
  const formatter = new Intl.NumberFormat("en-US", options);

  return (
    <>
      {formatter.format(value)}
      {suffix}
    </>
  );
}
