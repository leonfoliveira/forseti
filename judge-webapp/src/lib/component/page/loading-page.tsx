import React from "react";

import { Spinner } from "@/lib/component/spinner";

/**
 * LoadingPage component displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  return (
    <div className="h-dvh flex justify-center items-center">
      <Spinner size="lg" />
    </div>
  );
}
