import { Card } from "@/app/_lib/component/base/display/card";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  empty: {
    id: "app.[slug].(dashboard)._common.clarifications.empty-clarification-display.empty",
    defaultMessage: "No clarifications yet",
  },
});

export function EmptyClarificationDisplay() {
  return (
    <Card className="max-w-4xl w-full" data-testid="empty">
      <Card.Body>
        <p className="text-neutral-content text-center my-10 text-foreground-400">
          <FormattedMessage {...messages.empty} />
        </p>
      </Card.Body>
    </Card>
  );
}
