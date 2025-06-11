import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";

export function recalculateSubmissions(
  submissions:
    | SubmissionPublicResponseDTO[]
    | SubmissionFullResponseDTO[]
    | undefined,
  newSubmission: SubmissionPublicResponseDTO | SubmissionFullResponseDTO,
): SubmissionPublicResponseDTO[] | SubmissionFullResponseDTO[] {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission) return [...(submissions || []), newSubmission];
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, ...newSubmission } : it,
  );
}
