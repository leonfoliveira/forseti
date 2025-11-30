import { ClarificationResponseDTO } from "@/core/port/dto/response/clarification/ClarificationResponseDTO";

/**
 * Find a clarification by its ID within a nested array of clarifications.
 *
 * @param data - The array of ClarificationResponseDTO objects to search through.
 * @param id - The ID of the clarification to find.
 * @returns The ClarificationResponseDTO object with the matching ID, or undefined if not found.
 */
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
