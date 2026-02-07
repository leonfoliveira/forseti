import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
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
    <footer className="bg-content1 border-divider border-t text-center text-sm text-neutral-400">
      <a href="https://github.com/leonfoliveira/forseti" target="_blank">
        <FormattedMessage
          {...messages.text}
          values={{
            version: serverConfig.version,
          }}
        />
      </a>
    </footer>
  );
}
