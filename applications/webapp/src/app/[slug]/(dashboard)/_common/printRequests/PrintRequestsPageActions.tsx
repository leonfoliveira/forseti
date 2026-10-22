import { TableCell } from "@/app/_lib/component/shadcn/table";
import { PrintRequestResponseDTO } from "@/port/dto/response/printRequest/PrintRequestResponseDTO";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_lib/component/shadcn/tooltip";
import { AsyncButton } from "@/app/_lib/component/form/AsyncButton";
import { PrinterIcon, CheckIcon, XIcon } from "lucide-react";
import { useLoadableState } from "@/app/_lib/hook/useLoadableState";
import { Composition } from "@/config/composition";
import { useAppSelector } from "@/app/_lib/store/Store";
import { useToast } from "@/app/_lib/hook/useToast";
import { PrintRequestStatus } from "@/domain/enumerate/PrintRequestStatus";

type Props = {
  printRequest: PrintRequestResponseDTO;
  onUpdate: (printRequest: PrintRequestResponseDTO) => void;
};

export function PrintRequestsPageActions({ printRequest, onUpdate }: Props) {
  const contestId = useAppSelector((state) => state.contest.id);
  const printLoadableState = useLoadableState();
  const updateStatusLoadableState = useLoadableState();
  const toast = useToast();

  async function print() {
    try {
      printLoadableState.start();
      await Composition.attachmentReader.print(
        contestId,
        printRequest.submission.code,
      );
      printLoadableState.finish();
    } catch (error) {
      await printLoadableState.fail(error, {
        default: () => toast.error("Failed to print."),
      });
    }
  }

  async function updateStatus(status: PrintRequestStatus) {
    try {
      updateStatusLoadableState.start();
      const updatedPrintRequest =
        await Composition.printRequestWritter.updateStatus(
          contestId,
          printRequest.id,
          { status },
        );
      onUpdate(updatedPrintRequest);
      updateStatusLoadableState.finish();
    } catch (error) {
      await updateStatusLoadableState.fail(error, {
        default: () => toast.error("Failed to update print request status."),
      });
    }
  }

  return (
    <TableCell>
      <Tooltip>
        <TooltipTrigger asChild>
          <AsyncButton
            type="button"
            size="xs"
            data-testid="print-print-request-button"
            onClick={print}
            isLoading={printLoadableState.isLoading}
          >
            <PrinterIcon />
          </AsyncButton>
        </TooltipTrigger>
        <TooltipContent>Print</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <AsyncButton
            type="button"
            size="xs"
            data-testid="complete-print-request-button"
            onClick={() => updateStatus(PrintRequestStatus.COMPLETED)}
            isLoading={updateStatusLoadableState.isLoading}
            disabled={printRequest.status !== PrintRequestStatus.PENDING}
          >
            <CheckIcon />
          </AsyncButton>
        </TooltipTrigger>
        <TooltipContent>Complete</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <AsyncButton
            type="button"
            size="xs"
            data-testid="reject-print-request-button"
            onClick={() => updateStatus(PrintRequestStatus.REJECTED)}
            isLoading={updateStatusLoadableState.isLoading}
            disabled={printRequest.status !== PrintRequestStatus.PENDING}
          >
            <XIcon />
          </AsyncButton>
        </TooltipTrigger>
        <TooltipContent>Reject</TooltipContent>
      </Tooltip>
    </TableCell>
  );
}
