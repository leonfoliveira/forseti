import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/SubmissionFullResponseDTO";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";

export function recalculatePublicSubmissions(
  submissions: SubmissionPublicResponseDTO[] | undefined,
  newSubmission: SubmissionPublicResponseDTO,
): SubmissionPublicResponseDTO[] {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission) return [...(submissions || []), newSubmission];
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, status: newSubmission.status } : it,
  );
}

export function recalculatePrivateSubmissions(
  submissions: SubmissionFullResponseDTO[] | undefined,
  newSubmission: SubmissionPublicResponseDTO,
): SubmissionFullResponseDTO[] | undefined {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission) return submissions;
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, status: newSubmission.status } : it,
  );
}
