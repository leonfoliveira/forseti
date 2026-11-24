import { RefreshCwIcon } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Button } from "@/app/_lib/component/shadcn/button";

export default function ServerErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const previousPath = searchParams.get("from");

  function handleRetry() {
    navigate(previousPath!!);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        500
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage id="error.ServerErrorPage.text" />
      </h2>
      {previousPath && (
        <Button className="mt-10" onClick={handleRetry} data-testid="reload">
          <RefreshCwIcon />
          <FormattedMessage id="error.ServerErrorPage.buttonTryAgain" />
        </Button>
      )}
    </div>
  );
}
