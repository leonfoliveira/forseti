"use client";

import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  description: {
    id: "not-found.description",
    defaultMessage: "The page you are looking for could not be found.",
  },
});

export default function NotFoundPage() {
  return (
    <ErrorPageTemplate
      code={404}
      description={<FormattedMessage {...messages.description} />}
    />
  );
}
