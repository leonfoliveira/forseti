import React from "react";
import { EnumeratedTextUtil } from "@/app/_lib/util/EnumeratedTextUtil";

import { Badge } from "@/app/_lib/component/shadcn/badge";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";

type Props = React.ComponentProps<typeof Badge> & {
  status: SubmissionStatus;
};

/**
 * Displays a badge component styled according to the submission status.
 */
export function SubmissionStatusBadge({ status, ...props }: Props) {
  const text = EnumeratedTextUtil.getSubmissionStatus(status);

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
        <Badge data-testid="badge-judging" {...props} variant="secondary">
          {text}
        </Badge>
      );
  }
}
