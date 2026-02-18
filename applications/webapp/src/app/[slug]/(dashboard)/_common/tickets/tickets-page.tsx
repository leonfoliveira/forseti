import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { TicketsPageForm } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-form";
import { TicketsPageItem } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-item";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { TicketStatus } from "@/core/domain/enumerate/TicketStatus";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page.page-title",
    defaultMessage: "Forseti - Tickets",
  },
  pageDescription: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page.page-description",
    defaultMessage: "View and manage tickets for the contest.",
  },
  newLabel: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page.new-label",
    defaultMessage: "New Ticket",
  },
});

export type Props = {
  tickets: TicketResponseDTO[];
} & (
  | {
      canCreate: true;
      onCreate: (submission: TicketResponseDTO) => void;
    }
  | {
      canCreate?: false;
      onCreate?: (submission: TicketResponseDTO) => void;
    }
) &
  (
    | {
        canEdit: true;
        onEdit: (submission: TicketResponseDTO) => void;
      }
    | {
        canEdit?: false;
        onEdit?: (submission: TicketResponseDTO) => void;
      }
  );

export function TicketsPage({
  tickets,
  canCreate,
  onCreate,
  canEdit,
  onEdit,
}: Props) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const getColumnByStatus = (status: TicketStatus) => {
    return (
      <div
        className="flex flex-col gap-5"
        data-testid={`ticket-column-${status.toLowerCase()}`}
      >
        <h2 className="text-lg font-semibold">
          <FormattedMessage {...globalMessages.ticketStatus[status]} />
        </h2>
        {tickets
          .filter((ticket) => ticket.status === status)
          .map((ticket) => (
            <TicketsPageItem
              key={ticket.id}
              ticket={ticket}
              canEdit={canEdit}
              onEdit={onEdit}
            />
          ))}
      </div>
    );
  };

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center py-5">
        {canCreate && isCreateFormOpen && (
          <TicketsPageForm
            onCreate={(ticket) => {
              onCreate?.(ticket);
              setIsCreateFormOpen(false);
            }}
            onClose={() => setIsCreateFormOpen(false)}
          />
        )}

        {canCreate && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            <FormattedMessage {...messages.newLabel} />
          </Button>
        )}
        {canCreate && <Separator className="my-5 w-full max-w-4xl" />}

        <Card className="w-full">
          <CardContent>
            <div
              className="grid [grid-template-columns:1fr] gap-3 lg:[grid-template-columns:1fr_auto_1fr_auto_1fr]"
              data-testid="tickets-kanban"
            >
              {getColumnByStatus(TicketStatus.OPEN)}
              <Separator orientation="vertical" className="hidden lg:block" />
              <Separator orientation="horizontal" className="lg:hidden" />
              {getColumnByStatus(TicketStatus.IN_PROGRESS)}
              <Separator orientation="vertical" className="hidden lg:block" />
              <Separator orientation="horizontal" className="lg:hidden" />
              {getColumnByStatus(TicketStatus.RESOLVED)}
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
