import React from "react";

import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { Chip, ChipProps } from "@/app/_lib/heroui-wrapper";
import { ContestStatus } from "@/core/domain/enumerate/ContestStatus";
import { globalMessages } from "@/i18n/global";

type Props = ChipProps & {
  status: ContestStatus;
};

export function ContestStatusChip({ status, ...props }: Props) {
  const text = status && (
    <FormattedMessage {...globalMessages.contestStatus[status]} />
  );

  switch (status) {
    case ContestStatus.IN_PROGRESS:
      return (
        <Chip data-testid="chip-in-progress" {...props} color="success">
          {text}
        </Chip>
      );
    case ContestStatus.ENDED:
      return (
        <Chip data-testid="chip-ended" {...props} color="danger">
          {text}
        </Chip>
      );
    case ContestStatus.NOT_STARTED:
      return (
        <Chip data-testid="chip-not-started" {...props} color="warning">
          {text}
        </Chip>
      );
  }
}
