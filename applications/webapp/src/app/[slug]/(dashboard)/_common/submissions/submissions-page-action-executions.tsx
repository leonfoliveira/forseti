import { DownloadIcon, HistoryIcon } from "lucide-react";
import { useState } from "react";

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
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader } from "@/config/composition";
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
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          setIsDialogOpen(true);
        }}
        data-testid="submissions-page-action-executions"
      >
        <HistoryIcon />
        <FormattedMessage {...messages.executionsLabel} />
      </DropdownMenuItem>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(isOpen) => {
          setIsDialogOpen(isOpen);
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <DialogContent>
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
                    {execution.lastTestCase ? execution.lastTestCase + 1 : 0}/
                    {execution.totalTestCases}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        attachmentReader.download(contestId, execution.input)
                      }
                      size="sm"
                      variant="outline"
                      data-testid="submission-execution-input"
                    >
                      <DownloadIcon />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        attachmentReader.download(contestId, execution.output)
                      }
                      size="sm"
                      variant="outline"
                      data-testid="submission-execution-output"
                    >
                      <DownloadIcon />
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
