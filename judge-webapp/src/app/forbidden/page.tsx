"use client";

import { ErrorPageTemplate } from "@/app/_component/page/error-page-template";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  description: {
    id: "app.forbidden.page.description",
    defaultMessage: "You do not have permission to access this page.",
  },
});

export default function ForbiddenPage() {
  return (
    <ErrorPageTemplate
      code={403}
      description={<FormattedMessage {...messages.description} />}
    />
  );
}
