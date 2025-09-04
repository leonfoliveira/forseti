"use client";

import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";

const messages = defineMessages({
  description: {
    id: "app.not-found.description",
    defaultMessage: "The page you are looking for could not be found.",
  },
});

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        404
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
    </div>
  );
}
