import { RefreshCw } from "lucide-react";
import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app._lib.component.page.error-page.description",
    defaultMessage: "An unexpected error has occurred on the server.",
  },
  reload: {
    id: "app._lib.component.page.error-page.reload",
    defaultMessage: "Try again",
  },
});

/**
 * Displays a generic error message with a reload button centered on the page.
 */
export function ErrorPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
      <Button
        className="mt-10"
        onClick={() => window.location.reload()}
        data-testid="reload"
      >
        <RefreshCw />
        <FormattedMessage {...messages.reload} />
      </Button>
    </div>
  );
}
