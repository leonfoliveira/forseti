import { NumberFormatOptions } from "next-intl";

import { useIntl } from "@/app/_lib/util/intl-hook";

type Props = {
  value: number;
  suffix?: string;
  options?: NumberFormatOptions;
};

/**
 * Formats a number into a localized string.
 */
export function FormattedNumber({ value, suffix, options }: Props) {
  const intl = useIntl();

  return (
    <>
      {intl.formatNumber(value, options)}
      {suffix}
    </>
  );
}
