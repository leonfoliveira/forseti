import React, { useState } from "react";

import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-download";
import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-executions";
import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-judge";
import { SubmissionsPageActionPrint } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-print";
import { SubmissionsPageActionRerun } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-rerun";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useAppSelector } from "@/app/_store/store";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/core/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  actionsLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-actions-menu.actions-label",
    defaultMessage: "Actions",
  },
});

type Props = {
  submission:
    | SubmissionWithCodeResponseDTO
    | SubmissionWithCodeAndExecutionsResponseDTO;
  canViewExecutions?: boolean;
} & (
  | {
      canEdit: true;
      onEdit: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
    }
  | {
      canEdit?: false;
      onEdit?: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
    }
) &
  (
    | {
        canPrint: true;
        onPrint: (ticket: TicketResponseDTO) => void;
      }
    | {
        canPrint?: false;
        onPrint?: (ticket: TicketResponseDTO) => void;
      }
  );

export function SubmissionsPageActionsMenu({
  submission,
  canEdit,
  onEdit,
  canPrint,
  onPrint,
  canViewExecutions,
}: Props) {
  const isSubmissionPrintTicketEnabled = useAppSelector(
    (state) => state.contest.settings.isSubmissionPrintTicketEnabled,
  );
  const [isOpen, setIsOpen] = useState(false);
  const session = useAppSelector((state) => state.session);

  const close = () => setIsOpen(false);

  const items: React.ReactNode[] = [];

  if (submission.code) {
    items.push(
      <SubmissionsPageActionDownload
        key="download"
        submission={submission}
        onClose={close}
      />,
    );
  }

  if (
    canPrint &&
    isSubmissionPrintTicketEnabled &&
    submission.member.id === session?.member.id
  ) {
    items.push(
      <SubmissionsPageActionPrint
        key="print"
        submission={submission}
        onClose={close}
        onRequest={onPrint!}
      />,
    );
  }

  if (canViewExecutions) {
    items.push(
      <SubmissionsPageActionExecutions
        key="executions"
        executions={
          (submission as SubmissionWithCodeAndExecutionsResponseDTO).executions
        }
        onClose={close}
      />,
    );
  }

  if (canEdit) {
    if (submission.status != SubmissionStatus.JUDGING) {
      items.push(
        <SubmissionsPageActionRerun
          key="rerun"
          submission={submission as SubmissionWithCodeAndExecutionsResponseDTO}
          onClose={close}
          onRerun={onEdit!}
        />,
      );
    }
    items.push(
      <SubmissionsPageActionJudge
        key="judge"
        submission={submission as SubmissionWithCodeAndExecutionsResponseDTO}
        onClose={close}
        onJudge={onEdit!}
      />,
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-end gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="xs"
            variant="outline"
            data-testid="submission-actions-button"
          >
            ...
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40" align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <FormattedMessage {...messages.actionsLabel} />
            </DropdownMenuLabel>
            {submission.code && (
              <SubmissionsPageActionDownload
                submission={submission}
                onClose={close}
              />
            )}
            {canPrint &&
              isSubmissionPrintTicketEnabled &&
              submission.member.id === session?.member.id && (
                <SubmissionsPageActionPrint
                  submission={submission}
                  onClose={close}
                  onRequest={onPrint}
                />
              )}
            {canViewExecutions && (
              <SubmissionsPageActionExecutions
                executions={
                  (submission as SubmissionWithCodeAndExecutionsResponseDTO)
                    .executions
                }
                onClose={close}
              />
            )}
            {canEdit && (
              <>
                {submission.status != SubmissionStatus.JUDGING && (
                  <SubmissionsPageActionRerun
                    submission={
                      submission as SubmissionWithCodeAndExecutionsResponseDTO
                    }
                    onClose={close}
                    onRerun={onEdit}
                  />
                )}
                <SubmissionsPageActionJudge
                  submission={
                    submission as SubmissionWithCodeAndExecutionsResponseDTO
                  }
                  onClose={close}
                  onJudge={onEdit}
                />
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
