"use client";

import { ArrowPathRoundedSquareIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/app/_lib/component/base/form/button";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  description: {
    id: "app.error.500.description",
    defaultMessage: "An unexpected error has occurred on the server.",
  },
  reload: {
    id: "app.error.500.reload",
    defaultMessage: "Try again",
  },
});

function Error500Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previousPath = searchParams.get("from");

  function handleRetry() {
    if (previousPath) {
      router.push(previousPath);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-8xl font-bold font-mono" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage {...messages.description} />
      </h2>
      {previousPath && (
        <Button
          color="primary"
          className="mt-10"
          onPress={handleRetry}
          data-testid="reload"
        >
          <ArrowPathRoundedSquareIcon width={20} />
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
