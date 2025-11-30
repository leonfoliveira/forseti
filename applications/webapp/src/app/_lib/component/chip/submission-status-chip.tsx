import React from "react";

import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Chip, ChipProps } from "@/app/_lib/heroui-wrapper";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { globalMessages } from "@/i18n/global";

type Props = ChipProps & {
  status: SubmissionStatus;
};

/**
 * Displays a chip component styled according to the submission status.
 */
export function SubmissionStatusChip({ status, ...props }: Props) {
  const text = (
    <FormattedMessage {...globalMessages.submissionStatus[status]} />
  );

  switch (status) {
    case SubmissionStatus.JUDGED:
      return (
        <Chip data-testid="chip-judged" {...props} color="success">
          {text}
        </Chip>
      );
    case SubmissionStatus.FAILED:
      return (
        <Chip data-testid="chip-failed" {...props} color="danger">
          {text}
        </Chip>
      );
    case SubmissionStatus.JUDGING:
      return (
        <Chip data-testid="chip-judging" {...props} color="default">
          {text}
        </Chip>
      );
  }
}
