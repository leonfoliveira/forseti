"use client";

import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  description: {
    id: "error.description",
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
