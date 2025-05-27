import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";
import { submissionService } from "@/app/_composition";

export function useCreateSubmissionAction() {
  const toast = useToast();
  const signOutAction = useMemberSignOutAction();

  async function createSubmission(
    contestId: number,
    input: CreateSubmissionInputDTO,
  ) {
    try {
      const submission = await submissionService.createSubmission(input);
      toast.success("Submission sent successfully");
      return submission;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await signOutAction.act(contestId);
      } else {
        toast.error("Error creating contest");
      }
    }
  }

  return useAction(createSubmission);
}
