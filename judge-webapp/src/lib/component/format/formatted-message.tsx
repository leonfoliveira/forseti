import { Message } from "@/i18n/message";
import { useIntl } from "@/lib/util/intl-hook";

export function FormattedMessage(props: Message) {
  const i18n = useIntl();

  return i18n.formatMessage(props);
}
