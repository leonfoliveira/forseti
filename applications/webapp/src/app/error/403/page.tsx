"use client";

import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.error.403.description",
    defaultMessage: "You do not have permission to access this page.",
  },
});

/**
 * Displays a 403 Forbidden error page.
 */
export default function Error403Page() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        403
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
    </div>
  );
}
