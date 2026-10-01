import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/app/_lib/component/shadcn/button";

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
        An unexpected error has occurred on the server.
      </h2>
      <Button
        className="mt-10"
        onClick={() => window.location.reload()}
        data-testid="reload"
      >
        <RefreshCwIcon />
        Try again
      </Button>
    </div>
  );
}
