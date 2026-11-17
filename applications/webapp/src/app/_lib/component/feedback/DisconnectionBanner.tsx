import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

export function DisconnectionBanner() {
  return (
    <div
      className="bg-red-600 text-center text-sm text-white"
      data-testid="disconnection-banner"
    >
      <FormattedMessage id="_lib.component.feedback.DisconnectionBanner.message" />
    </div>
  );
}
