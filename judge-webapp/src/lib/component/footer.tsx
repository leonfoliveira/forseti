import { defineMessages, FormattedMessage } from "react-intl";

import { env } from "@/config/env";

const messages = defineMessages({
  text: {
    id: "app._component.footer.text",
    defaultMessage: "Judge {version}",
  },
});

export function Footer() {
  return (
    <footer className="footer footer-center bg-base-100 text-base-content/50 text-xs py-1 border-t border-solid border-base-300">
      <p className="inline" data-testid="footer">
        <a
          href="https://github.com/leonfoliveira/judge"
          target="_blank"
          data-testid="github-link"
        >
          <FormattedMessage
            {...messages.text}
            values={{
              version: env.VERSION,
            }}
          />
        </a>
      </p>
    </footer>
  );
}
