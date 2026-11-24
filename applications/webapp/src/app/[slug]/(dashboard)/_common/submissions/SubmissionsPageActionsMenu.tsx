import React, { useState } from "react";

import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { useAppSelector } from "@/app/_lib/store/Store";
import { SubmissionsPageActionCreatePrintRequest } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionCreatePrintRequest";
import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload";
import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionExecutions";
import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge";
import { SubmissionsPageActionResubmit } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

type Props = {
  submission:
    SubmissionWithCodeResponseDTO | SubmissionWithCodeAndExecutionsResponseDTO;
  canDownloadAny?: boolean;
  canViewExecutions?: boolean;
  onEdit?: (submission: SubmissionWithCodeAndExecutionsResponseDTO) => void;
  onCreatePrintRequest?: (printRequest: PrintRequestResponseDTO) => void;
};

export function SubmissionsPageActionsMenu({
  submission,
  canDownloadAny,
  canViewExecutions,
  onEdit,
  onCreatePrintRequest,
}: Props) {
  const contest = useAppSelector((state) => state.contest);
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  const items: React.ReactNode[] = [];

  const canEdit = !!onEdit;
  const canCreatePrintRequest = !!onCreatePrintRequest;

  if (canDownloadAny || submission.code) {
    items.push(
      <SubmissionsPageActionDownload
        key="download"
        submission={submission as SubmissionWithCodeResponseDTO}
        onClose={close}
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
    if (
      contest.settings.isAutoJudgeEnabled &&
      submission.status != SubmissionStatus.JUDGING
    ) {
      items.push(
        <SubmissionsPageActionResubmit
          key="rerun"
          submission={submission as SubmissionWithCodeAndExecutionsResponseDTO}
          onClose={close}
          onResubmit={onEdit!}
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

  if (canCreatePrintRequest && contest.settings.isPrintRequestEnabled) {
    items.push(
      <SubmissionsPageActionCreatePrintRequest
        key="create-print-request"
        submission={submission as SubmissionWithCodeResponseDTO}
        onClose={close}
        onCreatePrintRequest={onCreatePrintRequest}
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
              <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionsMenu.labelActions" />
            </DropdownMenuLabel>
            {items}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
