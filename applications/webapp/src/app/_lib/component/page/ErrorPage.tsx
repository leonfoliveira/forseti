import { RefreshCwIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/_lib/component/shadcn/button";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

/**
 * Displays a generic error message with a reload button centered on the page.
 */
export function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage id="_lib.component.page.ErrorPage.message" />
      </h2>
      <Button
        className="mt-10"
        onClick={() => navigate(0)}
        data-testid="reload"
      >
        <RefreshCwIcon />
        <FormattedMessage id="_lib.component.page.ErrorPage.tryAgain" />
      </Button>
    </div>
  );
}
