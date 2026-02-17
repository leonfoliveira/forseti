import { useState } from "react";

import { SubmissionsPageActionDownload } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-download";
import { SubmissionsPageActionExecutions } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-executions";
import { SubmissionsPageActionJudge } from "@/app/[slug]/(dashboard)/_common/submissions/submissions-page-action-judge";
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
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { SubmissionFullResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionFullWithExecutionResponseDTO } from "@/core/port/dto/response/submission/SubmissionFullWithExecutionResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  actionsLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-actions-menu.actions-label",
    defaultMessage: "Actions",
  },
});

type Props = {
  submission:
    | SubmissionFullResponseDTO
    | SubmissionFullWithExecutionResponseDTO;
} & (
  | {
      canEdit: true;
      onEdit: (submission: SubmissionFullWithExecutionResponseDTO) => void;
    }
  | {
      canEdit?: false;
      onEdit?: (submission: SubmissionFullWithExecutionResponseDTO) => void;
    }
);

export function SubmissionsPageActionsMenu({
  submission,
  canEdit,
  onEdit,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

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
            {canEdit && (
              <>
                <SubmissionsPageActionExecutions
                  executions={
                    (submission as SubmissionFullWithExecutionResponseDTO)
                      .executions
                  }
                  onClose={close}
                />
                {submission.status != SubmissionStatus.JUDGING && (
                  <SubmissionsPageActionRerun
                    submission={
                      submission as SubmissionFullWithExecutionResponseDTO
                    }
                    onClose={close}
                    onRerun={onEdit}
                  />
                )}
                <SubmissionsPageActionJudge
                  submission={
                    submission as SubmissionFullWithExecutionResponseDTO
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
