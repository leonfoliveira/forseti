import {
  ArrowDownTrayIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/solid";

import { Button } from "@/app/_lib/component/base/form/button";
import { Tooltip } from "@/app/_lib/component/base/overlay/tooltip";
import { GridTable } from "@/app/_lib/component/base/table/grid-table";
import { SubmissionAnswerChip } from "@/app/_lib/component/chip/submission-answer-chip";
import { SubmissionStatusChip } from "@/app/_lib/component/chip/submission-status-chip";
import { FormattedDateTime } from "@/app/_lib/component/format/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/format/formatted-message";
import { GavelIcon } from "@/app/_lib/component/icon/GavelIcon";
import { cls } from "@/app/_lib/util/cls";
import { attachmentReader } from "@/config/composition";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/port/dto/response/submission/SubmissionPublicResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  downloadTooltip: {
    id: "app.[slug].(dashboard)._common.submissions.submission-row.download-tooltip",
    defaultMessage: "Download",
  },
  resubmitTooltip: {
    id: "app.[slug].(dashboard)._common.submissions.submission-row.resubmit-tooltip",
    defaultMessage: "Resubmit",
  },
  judgeTooltip: {
    id: "app.[slug].(dashboard)._common.submissions.submission-row.judge-tooltip",
    defaultMessage: "Judge",
  },
});

type Props = {
  submission: SubmissionPublicResponseDTO;
  index: number;
  isHighlighted: boolean;
  canEdit?: boolean;
  contestId: string;
  onJudge: (submissionId: string) => void;
  onResubmit: (submissionId: string) => void;
};

export function SubmissionRow({
  submission,
  index,
  isHighlighted,
  canEdit,
  contestId,
  onJudge,
  onResubmit,
}: Props) {
  return (
    <GridTable.Row
      key={submission.id}
      className={cls(
        index % 2 == 1 && "bg-content2",
        isHighlighted && "bg-primary-50",
        submission.status === SubmissionStatus.FAILED && "bg-danger-50",
      )}
      data-testid="submission"
    >
      <GridTable.Cell data-testid="submission-created-at">
        <FormattedDateTime timestamp={submission.createdAt} />
      </GridTable.Cell>
      <GridTable.Cell data-testid="submission-member-name">
        {submission.member.name}
      </GridTable.Cell>
      <GridTable.Cell
        className="justify-end"
        data-testid="submission-problem-letter"
      >
        {submission.problem.letter}
      </GridTable.Cell>
      <GridTable.Cell className="justify-end" data-testid="submission-language">
        <FormattedMessage {...globalMessages.language[submission.language]} />
      </GridTable.Cell>
      <GridTable.Cell className="justify-end" data-testid="submission-answer">
        <SubmissionAnswerChip size="sm" answer={submission.answer} />
      </GridTable.Cell>
      {canEdit && (
        <GridTable.Cell data-testid="submission-status">
          <SubmissionStatusChip size="sm" status={submission.status} />
        </GridTable.Cell>
      )}
      {canEdit && (
        <GridTable.Cell data-testid="submission-actions">
          <Tooltip content={<FormattedMessage {...messages.downloadTooltip} />}>
            <Button
              isIconOnly
              color="primary"
              variant="light"
              size="sm"
              onPress={() =>
                attachmentReader.download(
                  contestId,
                  (submission as SubmissionFullResponseDTO).code,
                )
              }
              data-testid="submission-download"
            >
              <ArrowDownTrayIcon className="h-5" />
            </Button>
          </Tooltip>
          <Tooltip content={<FormattedMessage {...messages.resubmitTooltip} />}>
            <Button
              isIconOnly
              color="primary"
              variant="light"
              size="sm"
              disabled={submission.status === SubmissionStatus.JUDGING}
              onPress={() => onResubmit(submission.id)}
              data-testid="submission-resubmit"
            >
              <ArrowPathRoundedSquareIcon className="h-5" />
            </Button>
          </Tooltip>
          <Tooltip content={<FormattedMessage {...messages.judgeTooltip} />}>
            <Button
              isIconOnly
              color="danger"
              variant="light"
              size="sm"
              onPress={() => onJudge(submission.id)}
              data-testid="submission-judge"
            >
              <GavelIcon className="h-5" />
            </Button>
          </Tooltip>
        </GridTable.Cell>
      )}
    </GridTable.Row>
  );
}
