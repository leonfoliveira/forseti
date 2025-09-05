import { Chip, ChipProps } from "@heroui/react";
import React from "react";

import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { globalMessages } from "@/i18n/global";
import { FormattedMessage } from "@/lib/component/format/formatted-message";

type Props = ChipProps & {
  status: SubmissionStatus;
};

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
