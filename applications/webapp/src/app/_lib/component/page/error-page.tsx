import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import React from "react";

import { Button } from "@/app/_lib/component/base/form/button";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app._lib.component.page.error-page.description",
    defaultMessage: "An unexpected error has occurred.",
  },
  reload: {
    id: "app._lib.component.page.error-page.reload",
    defaultMessage: "Reload the page",
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
        color="primary"
        className="mt-10"
        onPress={() => window.location.reload()}
        data-testid="reload"
      >
        <ArrowPathRoundedSquareIcon width={20} />
        <FormattedMessage {...messages.reload} />
      </Button>
    </div>
  );
}
