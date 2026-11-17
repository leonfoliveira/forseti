import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { env } from "@/config/env";

/**
 * Footer component displayed at the bottom of the web application.
 * Includes a link to the Project GitHub repository and displays the current version.
 */
export function Footer() {
  return (
    <footer className="bg-card border-divider border-t py-1 text-center text-xs text-neutral-400">
      <p data-testid="footer-text" suppressHydrationWarning>
        <FormattedMessage
          id="_lib.component.layout.Footer.message"
          values={{ version: env.version }}
        />
      </p>
    </footer>
  );
}
