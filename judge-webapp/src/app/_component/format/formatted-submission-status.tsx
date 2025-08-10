import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  [SubmissionStatus.JUDGING]: {
    id: "_component.format.formatted-submission-status.judging",
    defaultMessage: "Judging",
  },
  [SubmissionStatus.FAILED]: {
    id: "_component.format.formatted-submission-status.failed",
    defaultMessage: "Failed",
  },
  [SubmissionStatus.JUDGED]: {
    id: "_component.format.formatted-submission-status.judged",
    defaultMessage: "Judged",
  },
});

export function FormattedSubmissionStatus({
  status,
}: {
  status: SubmissionStatus;
}) {
  return <FormattedMessage {...messages[status]} />;
}
