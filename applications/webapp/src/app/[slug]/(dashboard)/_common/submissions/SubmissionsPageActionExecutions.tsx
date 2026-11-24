import { DownloadIcon, HistoryIcon } from "lucide-react";

import { SubmissionAnswerBadge } from "@/app/_lib/component/display/badge/SubmissionAnswerBadge";
import { FormattedDateTime } from "@/app/_lib/component/i18n/FormattedDateTime";
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
import { useDialog } from "@/app/_lib/hook/useDialog";
import { useAppSelector } from "@/app/_lib/store/Store";
import { Composition } from "@/config/composition";
import { AttachmentResponseDTO } from "@/port/dto/response/attachment/AttachmentResponseDTO";
import { ExecutionResponseDTO } from "@/port/dto/response/execution/ExecutionResponseDTO";
import { FormattedMessage } from "@/app/_lib/component/i18n/FormattedMessage";

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
        Executions
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
              <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.executionsDialogTitle" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.executionsDialogDescription" />
            </DialogDescription>
          </DialogHeader>

          <Table data-testid="submission-executions-table">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerTimestamp" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerStatus" />
                </TableHead>
                <TableHead>
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerTestCases" />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerMaxTime" />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerMaxPeakMemory" />
                </TableHead>
                <TableHead className="text-right">
                  <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.headerDetails" />
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
                  <TableCell data-testid="submission-execution-answer">
                    <SubmissionAnswerBadge answer={execution.answer} />
                  </TableCell>
                  <TableCell data-testid="submission-execution-test-cases">
                    {execution.approvedTestCases}/{execution.totalTestCases}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    data-testid="submission-execution-max-time"
                  >
                    {execution.maxCpuTimeMs &&
                      `${execution.maxCpuTimeMs} ms / ${execution.maxClockTimeMs} ms`}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    data-testid="submission-execution-max-peak-memory"
                  >
                    {execution.maxPeakMemoryKb &&
                      `${execution.maxPeakMemoryKb} KB`}
                  </TableCell>
                  <TableCell className="text-right">
                    {execution.details && (
                      <Button
                        type="button"
                        size="xs"
                        variant="default"
                        onClick={() =>
                          Composition.attachmentReader.download(
                            contestId,
                            execution.details as AttachmentResponseDTO,
                          )
                        }
                        data-testid="submission-execution-details"
                      >
                        <DownloadIcon size={16} className="mr-1" />
                        <FormattedMessage id="[slug].(dashboard)._common.submissions.SubmissionsPageActionExecutions.buttonDownload" />
                      </Button>
                    )}
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
