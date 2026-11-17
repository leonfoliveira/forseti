import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

export function FreezeBanner() {
  return (
    <div
      className="flex items-center justify-center gap-1 bg-blue-400 text-sm text-white"
      data-testid="freeze-banner"
    >
      <FormattedMessage id="_lib.component.feedback.FreezeBanner.message" />
    </div>
  );
}
