import { Spinner } from "@/app/_component/spinner";
import React from "react";

/**
 * LoadingPage component displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  return (
    <div
      className="h-dvh flex justify-center items-center"
      data-testid="loading-page"
    >
      <Spinner size="lg" />
    </div>
  );
}
