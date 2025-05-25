import { SubmissionResponseDTO } from "@/core/repository/dto/response/SubmissionResponseDTO";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";

export function recalculateSubmissions(
  submissions: SubmissionResponseDTO[] | undefined,
  newSubmission: SubmissionEmmitDTO,
): SubmissionResponseDTO[] {
  const oldSubmission = submissions?.find((it) => it.id === newSubmission.id);
  if (!oldSubmission)
    return [...(submissions || []), newSubmission as SubmissionResponseDTO];
  return (submissions || []).map((it) =>
    it.id === newSubmission.id ? { ...it, status: newSubmission.status } : it,
  );
}
