"use client";

import { ClockAlertIcon } from "lucide-react";
import { useEffect } from "react";

import { Page } from "@/app/_lib/component/page/Page";
import { useAppSelector } from "@/app/_store/Store";

/**
 * A page displayed when the contest has not started yet.
 * Shows the contest title, start time, and supported languages.
 */
export function WaitPage() {
  const contestStartAt = useAppSelector((state) => state.contest.startAt);

  useEffect(() => {
    const now = new Date();
    const startAt = new Date(contestStartAt);
    const timeout = startAt.getTime() - now.getTime();

    // Maximum setTimeout value (24.86 days)
    const MAX_TIMEOUT = 2147483647;

    if (timeout > 0) {
      // Only set timeout if within safe limits
      if (timeout <= MAX_TIMEOUT) {
        const timer = setTimeout(() => {
          console.debug("Contest started. Reloading page...");
          window.location.reload();
        }, timeout);

        return () => clearTimeout(timer);
      }
    } else {
      console.debug("Contest already started. Reloading page...");
      window.location.reload();
    }
  }, [contestStartAt]);

  return (
    <Page
      title="Forseti - Waiting for the contest to start"
      description="Waiting page displayed when the contest has not started yet."
    >
      <div
        className="flex flex-1 items-center justify-center"
        data-testid="wait-page"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <ClockAlertIcon size={100} className="mb-5" />
          <p>
            The contest has not started yet. Please wait for the contest to
            start.
          </p>
          <p>The page will automatically reload when the contest starts.</p>
        </div>
      </div>
    </Page>
  );
}
