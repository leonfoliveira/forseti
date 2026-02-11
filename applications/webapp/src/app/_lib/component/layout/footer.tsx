import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { serverConfig } from "@/config/config";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  text: {
    id: "app._lib.component.footer.text",
    defaultMessage: "Forseti {version}",
  },
});

/**
 * Footer component displayed at the bottom of the web application.
 * Includes a link to the Project GitHub repository and displays the current version.
 */
export function Footer() {
  return (
    <footer className="bg-card border-divider border-t py-1 text-center text-xs text-neutral-400">
      <p data-testid="footer-text">
        <FormattedMessage
          {...messages.text}
          values={{
            version: serverConfig.version,
          }}
        />
      </p>
    </footer>
  );
}
