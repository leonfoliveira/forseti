"use client";

import { RefreshCwIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.error.500.page.description",
    defaultMessage: "An unexpected error has occurred on the server.",
  },
  reload: {
    id: "app.error.500.page.reload",
    defaultMessage: "Try again",
  },
});

function Error500Content() {
  const searchParams = useSearchParams();
  const previousPath = searchParams.get("from");

  function handleRetry() {
    if (previousPath) {
      window.location.href = previousPath;
    }
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
      {previousPath && (
        <Button className="mt-10" onClick={handleRetry} data-testid="reload">
          <RefreshCwIcon />
          <FormattedMessage {...messages.reload} />
        </Button>
      )}
    </div>
  );
}

/**
 * Displays a 500 Internal Server Error page.
 */
export default function Error500Page() {
  return (
    <Suspense>
      <Error500Content />
    </Suspense>
  );
}
