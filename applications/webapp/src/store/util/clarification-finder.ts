import { ClarificationResponseDTO } from "@/core/port/driven/repository/dto/response/clarification/ClarificationResponseDTO";

export function findClarification(
  data: ClarificationResponseDTO[],
  id: string,
): ClarificationResponseDTO | undefined {
  for (const clarification of data) {
    if (clarification.id === id) {
      return clarification;
    }

    const found = findClarification(clarification.children, id);
    if (found) {
      return found;
    }
  }

  return undefined;
}
