import { serverConfig } from "@/config/config";
import { defineMessages } from "@/i18n/message";
import { FormattedMessage } from "@/lib/component/format/formatted-message";

const messages = defineMessages({
  text: {
    id: "lib.component.footer.text",
    defaultMessage: "Forseti {version}",
  },
});

export function Footer() {
  return (
    <footer className="bg-content1 text-center text-neutral-400 text-sm border-t border-divider">
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
