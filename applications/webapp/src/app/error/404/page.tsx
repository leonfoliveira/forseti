"use client";

import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.error.404.description",
    defaultMessage: "The page you are looking for could not be found.",
  },
});

/**
 * Displays a 404 Not Found error page.
 */
export default function Error404Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        404
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
    </div>
  );
}
