import { CircleXIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { TicketsPageForm } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-form";
import { TicketsPageItem } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-item";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Button } from "@/app/_lib/component/shadcn/button";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/app/_lib/component/shadcn/empty";
import { Separator } from "@/app/_lib/component/shadcn/separator";
import { useAppSelector } from "@/app/_store/store";
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
  disabledTitle: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page.disabled-title",
    defaultMessage: "Disabled",
  },
  disabledDescription: {
    id: "app.[slug].(dashboard)._common.tickets.tickets-page.disabled-description",
    defaultMessage:
      "Support ticket creation is currently disabled for this contest.",
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
  const contestSettings = useAppSelector((state) => state.contest.settings);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const getColumnByStatus = (status: TicketStatus) => {
    return (
      <div
        className="flex flex-col gap-5"
        data-testid={`ticket-column-${status.toLowerCase()}`}
      >
        <h2 className="text-md font-semibold">
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

  const isAnyTicketEnabled =
    contestSettings.isNonTechnicalSupportTicketEnabled ||
    contestSettings.isTechnicalSupportTicketEnabled;

  const shouldSeeCreationComponents = canCreate && isAnyTicketEnabled;

  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center py-5">
        {shouldSeeCreationComponents && isCreateFormOpen && (
          <TicketsPageForm
            onCreate={(ticket) => {
              onCreate?.(ticket);
              setIsCreateFormOpen(false);
            }}
            onClose={() => setIsCreateFormOpen(false)}
          />
        )}

        {shouldSeeCreationComponents && !isCreateFormOpen && (
          <Button
            onClick={() => setIsCreateFormOpen(true)}
            data-testid="open-create-form-button"
          >
            <PlusIcon size={16} />
            <FormattedMessage {...messages.newLabel} />
          </Button>
        )}
        {shouldSeeCreationComponents && (
          <Separator className="my-5 w-full max-w-4xl" />
        )}

        {!isAnyTicketEnabled && (
          <Empty data-testid="disabled">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleXIcon size={48} />
              </EmptyMedia>
              <EmptyTitle>
                <FormattedMessage {...messages.disabledTitle} />
              </EmptyTitle>
            </EmptyHeader>
            <EmptyDescription>
              <FormattedMessage {...messages.disabledDescription} />
            </EmptyDescription>
          </Empty>
        )}

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
