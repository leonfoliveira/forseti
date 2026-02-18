import { ArrowRightLeftIcon, DotIcon, PrinterIcon } from "lucide-react";

import { TicketTypeBadge } from "@/app/_lib/component/display/badge/ticket-type-badge";
import { AsyncButton } from "@/app/_lib/component/form/async-button";
import { FormattedDateTime } from "@/app/_lib/component/i18n/formatted-datetime";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_lib/component/shadcn/dropdown-menu";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@/app/_lib/component/shadcn/item";
import { useLoadableState } from "@/app/_lib/hook/loadable-state-hook";
import { useToast } from "@/app/_lib/hook/toast-hook";
import { useAppSelector } from "@/app/_store/store";
import { attachmentReader, ticketWritter } from "@/config/composition";
import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketType } from "@/core/domain/enumerate/TicketType";
import { AttachmentResponseDTO } from "@/core/port/dto/response/attachment/AttachmentResponseDTO";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  moveLabel: {
    id: "app.[slug].(dashboard).tickets.move-label",
    defaultMessage: "Move",
  },
  printSubmissionText: {
    id: "app.[slug].(dashboard).tickets.print-submission-text",
    defaultMessage: "Please, print my submission",
  },
  printLabel: {
    id: "app.[slug].(dashboard).tickets.print-label",
    defaultMessage: "Print",
  },
  printError: {
    id: "app.[slug].(dashboard).tickets.print-error",
    defaultMessage: "Failed to download attachment",
  },
  updateStatusError: {
    id: "app.[slug].(dashboard).tickets.update-status-error",
    defaultMessage: "Failed to update ticket status",
  },
});

type Props = {
  ticket: TicketResponseDTO;
  canEdit?: boolean;
  onEdit?: (ticket: TicketResponseDTO) => void;
};

export function TicketsPageItem({ ticket, canEdit, onEdit }: Props) {
  const contestId = useAppSelector((state) => state.contestMetadata.id);
  const printAttachmentState = useLoadableState();
  const updateStatusState = useLoadableState();
  const toast = useToast();

  async function printAttachment(attachmentId: string) {
    printAttachmentState.start();
    try {
      await attachmentReader.print(contestId, {
        attachmentId,
      } as unknown as AttachmentResponseDTO);

      printAttachmentState.finish();
    } catch (error) {
      printAttachmentState.fail(error, {
        default: () => toast.error(messages.printError),
      });
    }
  }

  async function updateStatus(newStatus: TicketStatus) {
    updateStatusState.start();
    try {
      const updatedTicket = await ticketWritter.updateStatus(
        contestId,
        ticket.id,
        newStatus,
      );

      onEdit?.(updatedTicket);
      updateStatusState.finish();
    } catch (error) {
      updateStatusState.fail(error, {
        default: () => toast.error(messages.updateStatusError),
      });
    }
  }

  return (
    <Item variant="outline" data-testid="ticket-item">
      <ItemContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <ItemTitle className="gap-0">
              <span data-testid="ticket-member-name">{ticket.member.name}</span>
              <DotIcon className="w-4" />
              <span
                data-testid="ticket-member-type"
                className="text-muted-foreground text-xs"
              >
                <FormattedMessage
                  {...globalMessages.memberType[ticket.member.type]}
                />
              </span>
            </ItemTitle>
            <div
              className="text-muted-foreground flex items-center gap-2 text-xs"
              data-testid="ticket-created-at"
            >
              <FormattedDateTime timestamp={ticket.createdAt} />
            </div>
          </div>
          <TicketTypeBadge type={ticket.type} />
        </div>

        <ItemDescription>
          {ticket.type === TicketType.SUBMISSION_PRINT && (
            <span
              className="block rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
              data-testid="ticket-description"
            >
              <FormattedMessage {...messages.printSubmissionText} />
            </span>
          )}

          {[
            TicketType.TECHNICAL_SUPPORT,
            TicketType.NON_TECHNICAL_SUPPORT,
          ].includes(ticket.type) && (
            <span
              className="block rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
              data-testid="ticket-description"
            >
              {(ticket.properties as { description: string }).description}
            </span>
          )}
        </ItemDescription>

        {(canEdit || ticket.staff) && (
          <ItemFooter
            className={`border-border/50 flex items-center gap-2 border-t pt-2 ${ticket.staff ? "justify-between" : "justify-end"}`}
          >
            {ticket.staff && (
              <div className="flex flex-col gap-1">
                <p
                  className="text-muted-foreground text-xs font-medium"
                  data-testid="ticket-staff-name"
                >
                  {ticket.staff.name}
                </p>
                <p
                  className="text-muted-foreground text-xs"
                  data-testid="ticket-updated-at"
                >
                  <FormattedDateTime timestamp={ticket.updatedAt} />
                </p>
              </div>
            )}

            <div className="flex gap-2">
              {canEdit && ticket.type === TicketType.SUBMISSION_PRINT && (
                <AsyncButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    printAttachment(ticket.properties.attachmentId)
                  }
                  isLoading={printAttachmentState.isLoading}
                  data-testid="print-attachment-button"
                >
                  <PrinterIcon className="h-4 w-4" />
                  <FormattedMessage {...messages.printLabel} />
                </AsyncButton>
              )}

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AsyncButton
                      variant="outline"
                      size="sm"
                      className="justify-self-end"
                      isLoading={updateStatusState.isLoading}
                      data-testid="move-ticket-button"
                    >
                      <ArrowRightLeftIcon className="h-4 w-4" />
                      <FormattedMessage {...messages.moveLabel} />
                    </AsyncButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      {Object.keys(TicketStatus)
                        .filter((status) => status !== ticket.status)
                        .map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => updateStatus(status as TicketStatus)}
                            data-testid={`move-ticket-button-${status.toLowerCase()}`}
                          >
                            <FormattedMessage
                              {...globalMessages.ticketStatus[
                                status as TicketStatus
                              ]}
                            />
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </ItemFooter>
        )}
      </ItemContent>
    </Item>
  );
}
