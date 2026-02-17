import {
  Item,
  ItemContent,
  ItemDescription,
} from "@/app/_lib/component/shadcn/item";
import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

type Props = {
  ticket: TicketResponseDTO;
};

export function TicketsPageItem({ ticket }: Props) {
  return (
    <Item>
      <ItemContent>
        <ItemDescription></ItemDescription>
      </ItemContent>
    </Item>
  );
}
