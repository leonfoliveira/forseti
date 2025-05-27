import { SubmissionPrivateResponseDTO } from "@/core/repository/dto/response/SubmissionPrivateResponseDTO";
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
  submissions: SubmissionPrivateResponseDTO[] | undefined,
  newSubmission: SubmissionPublicResponseDTO,
): SubmissionPrivateResponseDTO[] | undefined {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission) return submissions;
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, status: newSubmission.status } : it,
  );
}
