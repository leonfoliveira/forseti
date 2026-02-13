import { LoaderIcon } from "lucide-react";

/**
 * Displays a loading spinner centered on the page.
 */
export function LoadingPage() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <LoaderIcon className="animate-spin" size={48} data-testid="loader" />
    </div>
  );
}
