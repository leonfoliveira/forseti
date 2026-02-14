"use client";

import { RefreshCwIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.error.503.page.description",
    defaultMessage:
      "The service is temporarily unavailable. Please try again later.",
  },
  reload: {
    id: "app.error.503.page.reload",
    defaultMessage: "Try again",
  },
});

function Error503Content() {
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
        503
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
 * Displays a 503 Service Unavailable error page.
 */
export default function Error503Page() {
  return (
    <Suspense>
      <Error503Content />
    </Suspense>
  );
}
