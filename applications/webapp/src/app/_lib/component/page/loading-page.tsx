import { Loader } from "lucide-react";
import React from "react";

/**
 * Displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Loader className="animate-spin" size={48} data-testid="loader" />
    </div>
  );
}
