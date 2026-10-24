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
  const completeLoadableState = useLoadableState();
  const rejectLoadableState = useLoadableState();
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
    const loadableState =
      status === PrintRequestStatus.COMPLETED
        ? completeLoadableState
        : rejectLoadableState;

    try {
      loadableState.start();
      const updatedPrintRequest =
        await Composition.printRequestWriter.updateStatus(
          contestId,
          printRequest.id,
          { status },
        );
      onUpdate(updatedPrintRequest);
      loadableState.finish();
    } catch (error) {
      await loadableState.fail(error, {
        default: () => toast.error("Failed to update print request status."),
      });
    }
  }

  const isAnyUpdateStatusLoadableStateLoading =
    completeLoadableState.isLoading || rejectLoadableState.isLoading;

  return (
    <div className="flex justify-end space-x-2">
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
            isLoading={completeLoadableState.isLoading}
            disabled={
              printRequest.status !== PrintRequestStatus.PENDING ||
              isAnyUpdateStatusLoadableStateLoading
            }
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
            onClick={() => updateStatus(PrintRequestStatus.REFUSED)}
            isLoading={rejectLoadableState.isLoading}
            disabled={
              printRequest.status !== PrintRequestStatus.PENDING ||
              isAnyUpdateStatusLoadableStateLoading
            }
          >
            <XIcon />
          </AsyncButton>
        </TooltipTrigger>
        <TooltipContent>Reject</TooltipContent>
      </Tooltip>
    </div>
  );
}
