import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

/**
 * Displays a 403 Forbidden error page.
 */
export default function ForbiddenPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="font-mono text-8xl font-bold" data-testid="code">
        403
      </h1>
      <h2 className="text-md mt-5" data-testid="description">
        <FormattedMessage id="error.ForbiddenPage.text" />
      </h2>
    </div>
  );
}
