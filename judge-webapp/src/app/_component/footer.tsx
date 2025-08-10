import { env } from "@/config/env";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  text: {
    id: "app._component.footer.text",
    defaultMessage: "Judge {version} | by {author}",
  },
});

export function Footer() {
  return (
    <footer className="footer footer-center bg-base-100 text-base-content/50 text-xs py-1 border-t border-solid border-base-300">
      <p data-testid="footer">
        <FormattedMessage
          {...messages.text}
          values={{
            version: env.VERSION,
            author: (
              <a
                href="https://github.com/leonfoliveira"
                target="_blank"
                data-testid="github-link"
              >
                @leonfoliveira
              </a>
            ),
          }}
        />
      </p>
    </footer>
  );
}
