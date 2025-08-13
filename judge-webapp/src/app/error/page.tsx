"use client";

import { defineMessages, FormattedMessage } from "react-intl";

import { ErrorPageTemplate } from "@/lib/component/page/error-page-template";

const messages = defineMessages({
  description: {
    id: "app.error.page.description",
    defaultMessage: "An unexpected error occurred. Please try again.",
  },
});

export default function ErrorPage() {
  return (
    <ErrorPageTemplate
      code={500}
      description={<FormattedMessage {...messages.description} />}
    />
  );
}
