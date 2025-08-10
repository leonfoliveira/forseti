import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [ContestStatus.ENDED]: {
    id: "_component.format.formatted-contest.ended",
    defaultMessage: "Ended",
  },
  [ContestStatus.IN_PROGRESS]: {
    id: "_component.format.formatted-contest.in-progress",
    defaultMessage: "In progress",
  },
  [ContestStatus.NOT_STARTED]: {
    id: "_component.format.formatted-contest.not-started",
    defaultMessage: "Not started",
  },
});

export function FormattedContestStatus({ status }: { status: ContestStatus }) {
  return <FormattedMessage {...messages[status]} />;
}
