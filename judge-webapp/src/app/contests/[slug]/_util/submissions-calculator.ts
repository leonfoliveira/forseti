import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";

/**
 * Recalculates the submissions array by updating an existing submission or adding a new one.
 */
export function recalculateSubmissions<
  TData extends SubmissionPublicResponseDTO[],
>(
  submissions: TData,
  newSubmission: SubmissionPublicResponseDTO | SubmissionFullResponseDTO,
): TData {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission) return [...(submissions || []), newSubmission] as TData;
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, ...newSubmission } : it,
  ) as TData;
}
