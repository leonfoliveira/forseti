import { useIntl } from "@/app/_lib/util/intl-hook";
import { Message } from "@/i18n/message";

type Props = {
  title: Message;
  description: Message;
};

export function Metadata({ title, description }: Props) {
  const intl = useIntl();

  return (
    <>
      <title>{intl.formatMessage(title)}</title>
      <meta name="description" content={intl.formatMessageRaw(description)} />
    </>
  );
}
