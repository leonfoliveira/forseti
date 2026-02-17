import { TicketsPageItem } from "@/app/[slug]/(dashboard)/_common/tickets/tickets-page-item";
import { FormattedMessage } from "@/app/_lib/component/i18n/formatted-message";
import { Page } from "@/app/_lib/component/page/page";
import { Card, CardContent } from "@/app/_lib/component/shadcn/card";
import {
  Item,
  ItemContent,
  ItemDescription,
} from "@/app/_lib/component/shadcn/item";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";
import { globalMessages } from "@/i18n/global";
import { defineMessages } from "@/i18n/message";
import { MockTicketResponseDTO } from "@/test/mock/response/ticket/MockTicketResponseDTO";

const messages = defineMessages({
  pageTitle: {
    id: "app.[slug].(dashboard).tickets.page-title",
    defaultMessage: "Forseti - Tickets",
  },
  pageDescription: {
    id: "app.[slug].(dashboard).tickets.page-description",
    defaultMessage: "View and manage tickets for the contest.",
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
  return (
    <Page title={messages.pageTitle} description={messages.pageDescription}>
      <div className="flex flex-col items-center py-5">
        <Card className="w-full">
          <CardContent>
            <div className="grid grid-cols-3">
              <div>
                <TicketsPageItem ticket={MockTicketResponseDTO()} />
              </div>
              <div></div>
              <div></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
