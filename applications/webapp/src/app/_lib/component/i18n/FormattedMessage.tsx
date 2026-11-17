import { useTranslation } from "react-i18next";

type Props = {
  id: string;
  values?: Record<string, unknown>;
};

export function FormattedMessage({ id, values }: Props) {
  const { t } = useTranslation();

  if (values) {
    return t(id, values);
  }
  return t(id);
}
