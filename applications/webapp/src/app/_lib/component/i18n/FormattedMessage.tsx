import type { ParseKeys, TOptions } from "i18next";
import { useTranslation } from "react-i18next";

type Props = {
  id: ParseKeys;
  values?: TOptions;
};

export function FormattedMessage({ id, values }: Props) {
  const { t } = useTranslation();

  if (values) {
    return t(id, values);
  }
  return t(id);
}
