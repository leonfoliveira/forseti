import React, { useState } from "react";

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
import { SubmissionWithCodeAndExecutionResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeAndExecutionResponseDTO";
import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/SubmissionsPageActionExecutions";
import { SubmissionWithCodeResponseDTO } from "@/port/dto/response/submission/SubmissionWithCodeResponseDTO";

type Props = {
  submission:
    SubmissionWithCodeResponseDTO | SubmissionWithCodeAndExecutionResponseDTO;
  canViewExecutions?: boolean;
} & (
  | {
      canEdit: true;
      onEdit: (submission: SubmissionWithCodeAndExecutionResponseDTO) => void;
    }
  | {
      canEdit?: false;
      onEdit?: (submission: SubmissionWithCodeResponseDTO) => void;
    }
);

export function SubmissionsPageActionsMenu({
  submission,
  canEdit,
  onEdit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  const items: React.ReactNode[] = [];

  if (submission.code) {
    items.push(
      <SubmissionsPageActionDownload
        key="download"
        submission={submission as SubmissionWithCodeResponseDTO}
        onClose={close}
      />,
    );
  }

  if (canEdit) {
    if (submission.status != SubmissionStatus.JUDGING) {
      items.push(
        <SubmissionsPageActionResubmit
          key="rerun"
          submission={submission as SubmissionWithCodeAndExecutionResponseDTO}
          onClose={close}
          onResubmit={onEdit!}
        />,
      );
    }
    items.push(
      <SubmissionsPageActionJudge
        key="judge"
        submission={submission as SubmissionWithCodeAndExecutionResponseDTO}
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {submission.code && (
              <SubmissionsPageActionDownload
                submission={submission}
                onClose={close}
              />
            )}

            {canEdit && (
              <>
                {submission.status != SubmissionStatus.JUDGING && (
                  <SubmissionsPageActionExecutions
                    executions={
                      (submission as SubmissionWithCodeAndExecutionResponseDTO)
                        .executions
                    }
                    onClose={close}
                  />
                )}
                {submission.status != SubmissionStatus.JUDGING && (
                  <SubmissionsPageActionResubmit
                    submission={
                      submission as SubmissionWithCodeAndExecutionResponseDTO
                    }
                    onClose={close}
                    onResubmit={onEdit}
                  />
                )}
                <SubmissionsPageActionJudge
                  submission={
                    submission as SubmissionWithCodeAndExecutionResponseDTO
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
