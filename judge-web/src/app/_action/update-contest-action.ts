import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { contestService } from "@/app/_composition";

export function useUpdateContestAction() {
  const toast = useToast();
  const signOutAction = useRootSignOutAction();

  function updateContest(input: UpdateContestInputDTO) {
    try {
      const contest = contestService.updateContest(input);
      toast.success("Contest updated successfully");
      return contest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        notFound();
      } else if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        signOutAction.act();
      } else {
        toast.error("Error updating contest");
      }
    }
  }

  return useAction(updateContest);
}
