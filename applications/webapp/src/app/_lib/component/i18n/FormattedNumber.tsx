import { useTranslation } from "react-i18next";

type Props = {
  value: number;
  suffix?: string;
  options?: Intl.NumberFormatOptions;
};

/**
 * Formats a number into a localized string.
 */
export function FormattedNumber({ value, suffix, options }: Props) {
  const { i18n } = useTranslation();

  const formatter = new Intl.NumberFormat(i18n.language, options);

  return (
    <>
      {formatter.format(value)}
      {suffix}
    </>
  );
}
