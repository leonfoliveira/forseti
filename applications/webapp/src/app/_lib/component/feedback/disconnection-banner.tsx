import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  listenerDisconnected: {
    id: "app._lib.component.feedback.disconnection-banner.listener-disconnected",
    defaultMessage:
      "Connection to server lost. Live updates are unavailable. Attempting to reconnect...",
  },
});

export function DisconnectionBanner() {
  return (
    <div
      className="bg-red-600 text-center text-sm text-white"
      data-testid="disconnection-banner"
    >
      <FormattedMessage {...messages.listenerDisconnected} />
    </div>
  );
}
