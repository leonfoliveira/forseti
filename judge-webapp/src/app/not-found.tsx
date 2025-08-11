"use client";

import { defineMessages, FormattedMessage } from "react-intl";

import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";

const messages = defineMessages({
  description: {
    id: "app.not-found.description",
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
