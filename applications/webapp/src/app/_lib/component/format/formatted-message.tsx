import { useIntl } from "@/app/_lib/util/intl-hook";
import { Message } from "@/i18n/message";

export function FormattedMessage(props: Message) {
  const i18n = useIntl();

  return i18n.formatMessage(props);
}
