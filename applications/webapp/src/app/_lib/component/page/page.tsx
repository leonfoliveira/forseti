"use client";

import { useIntl } from "@/app/_lib/hook/intl-hook";
import { Message } from "@/i18n/message";

type Props = {
  title: Message;
  description: Message;
  children: React.ReactNode;
};

/**
 * Displays a page with the given title and description in the metadata, and renders the children.
 * This is used as a wrapper for all pages in the dashboard to provide consistent metadata and layout.
 */
export function Page({ title, description, children }: Props) {
  const intl = useIntl();

  return (
    <>
      <title>{intl.formatMessage(title)}</title>
      <meta name="description" content={intl.formatMessageRaw(description)} />
      {children}
    </>
  );
}
