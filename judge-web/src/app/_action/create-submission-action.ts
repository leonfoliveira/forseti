import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { CreateSubmissionInputDTO } from "@/core/service/dto/input/CreateSubmissionInputDTO";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";

export function useCreateSubmissionAction() {
  const { problemService } = useContainer();
  const toast = useToast();
  const signOutAction = useMemberSignOutAction();

  async function createSubmission(
    contestId: number,
    problemId: number,
    input: CreateSubmissionInputDTO,
  ) {
    try {
      await problemService.createSubmission(problemId, input);
      toast.success("Submission sent successfully");
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
