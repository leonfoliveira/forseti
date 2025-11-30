import { useTranslations, useFormatter } from "next-intl";

import { Message } from "@/i18n/message";

/**
 * Custom hook to provide internationalization utilities.
 */
export function useIntl() {
  const t = useTranslations();
  const format = useFormatter();

  return {
    formatMessageRaw: (message: Message) => t(message.id, message.values),
    formatMessage: (
      message: Omit<Message, "defaultMessage"> & { defaultMessage?: string },
    ) => t.rich(message.id, message.values),
    formatDateTime: format.dateTime,
  };
}
