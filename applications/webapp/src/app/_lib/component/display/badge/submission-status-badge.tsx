import React from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Badge } from "@/app/_lib/component/shadcn/badge";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { globalMessages } from "@/i18n/global";

type Props = React.ComponentProps<typeof Badge> & {
  status: SubmissionStatus;
};

/**
 * Displays a badge component styled according to the submission status.
 */
export function SubmissionStatusBadge({ status, ...props }: Props) {
  const text = (
    <FormattedMessage {...globalMessages.submissionStatus[status]} />
  );

  switch (status) {
    case SubmissionStatus.JUDGED:
      return (
        <Badge data-testid="badge-judged" {...props} variant="success">
          {text}
        </Badge>
      );
    case SubmissionStatus.FAILED:
      return (
        <Badge data-testid="badge-failed" {...props} variant="destructive">
          {text}
        </Badge>
      );
    case SubmissionStatus.JUDGING:
      return (
        <Badge data-testid="badge-judging" {...props} variant="default">
          {text}
        </Badge>
      );
  }
}
