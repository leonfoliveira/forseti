import { TicketResponseDTO } from "@/core/port/dto/response/ticket/TicketResponseDTO";

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
  return null;
}
