import React, { useState } from "react";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionDownload";
import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionJudge";
import { SubmissionsPageActionResubmit } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionResubmit";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import { SubmissionStatus } from "@/domain/enumerate/SubmissionStatus";
import { SubmissionWithCodeAndExecutionsResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionsResponseDTO";
import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionExecutions";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";
import { SubmissionsPageActionCreatePrintRequest } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionCreatePrintRequest";

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
    if (submission.status != SubmissionStatus.JUDGING) {
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

  if (canCreatePrintRequest) {
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {items}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
