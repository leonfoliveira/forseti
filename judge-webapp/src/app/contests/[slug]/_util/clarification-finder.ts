import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";

export function findClarification(
  data: ClarificationResponseDTO[],
  id: string | undefined,
): ClarificationResponseDTO | undefined {
  if (!id) {
    return undefined;
  }

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
