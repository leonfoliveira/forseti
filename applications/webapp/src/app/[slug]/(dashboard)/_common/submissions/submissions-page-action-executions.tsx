import { DownloadIcon, HistoryIcon } from "lucide-react";

import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/submission-answer-chip";
import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Button } from "@/app/_lib/component/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/_lib/component/shadcn/dialog";
import { DropdownMenuItem } from "@/app/_lib/component/shadcn/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_lib/component/shadcn/table";
import { useDialog } from "@/app/_lib/hook/dialog-hook";
import { useAppSelector } from "@/app/_store/store";
import { Composition } from "@/config/composition";
import { ExecutionResponseDTO } from "@/core/port/dto/response/execution/ExecutionResponseDTO";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  executionsLabel: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.executions-label",
    defaultMessage: "Executions",
  },
  title: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.title",
    defaultMessage: "Executions History",
  },
  description: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.description",
    defaultMessage: "List of all executions for this submission.",
  },
  timestampHeader: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.timestamp-header",
    defaultMessage: "Timestamp",
  },
  statusHeader: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.status-header",
    defaultMessage: "Status",
  },
  testCases: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.test-cases",
    defaultMessage: "Test Cases",
  },
  inputHeader: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.input-header",
    defaultMessage: "Input",
  },
  outputHeader: {
    id: "app.[slug].(dashboard)._common.submissions.submissions-page-action-executions.output-header",
    defaultMessage: "Output",
  },
});

type Props = {
  executions: ExecutionResponseDTO[];
  onClose: () => void;
};

export function SubmissionsPageActionExecutions({
  executions,
  onClose,
}: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const dialog = useDialog();

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          dialog.open();
        }}
        data-testid="submissions-page-action-executions"
      >
        <HistoryIcon />
        <FormattedMessage {...messages.executionsLabel} />
      </DropdownMenuItem>

      <Dialog
        open={dialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dialog.close();
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage {...messages.title} />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage {...messages.description} />
            </DialogDescription>
          </DialogHeader>

          <Table data-testid="submission-executions-table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <FormattedMessage {...messages.timestampHeader} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.statusHeader} />
                </TableHead>
                <TableHead>
                  <FormattedMessage {...messages.testCases} />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage {...messages.inputHeader} />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage {...messages.outputHeader} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution) => (
                <TableRow
                  key={execution.id}
                  data-testid="submission-execution-row"
                >
                  <TableCell data-testid="submission-execution-timestamp">
                    <FormattedDateTime timestamp={execution.createdAt} />
                  </TableCell>
                  <TableCell data-testid="submission-execution-status">
                    <SubmissionAnswerBadge answer={execution.answer} />
                  </TableCell>
                  <TableCell data-testid="submission-execution-test-cases">
                    {execution.lastTestCase != null
                      ? execution.lastTestCase + 1
                      : 0}
                    /{execution.totalTestCases}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="xs"
                      variant="default"
                      onClick={() =>
                        Composition.attachmentReader.download(
                          contestId,
                          execution.input,
                        )
                      }
                      data-testid="submission-execution-input"
                    >
                      <DownloadIcon size={16} /> CSV
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="xs"
                      variant="default"
                      onClick={() =>
                        Composition.attachmentReader.download(
                          contestId,
                          execution.output,
                        )
                      }
                      data-testid="submission-execution-output"
                    >
                      <DownloadIcon size={16} /> CSV
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
