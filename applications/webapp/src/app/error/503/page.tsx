"use client";

import { RefreshCwIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/app/_lib/component/shadcn/button";

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
        Service Unavailable. Please try again later.
      </h2>
      {previousPath && (
        <Button className="mt-10" onClick={handleRetry} data-testid="reload">
          <RefreshCwIcon />
          Try again
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
