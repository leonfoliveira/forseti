import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useUpdateContestAction() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();

  async function updateContest(input: UpdateContestInputDTO) {
    try {
      const contest = await contestService.updateContest(input);
      alert.success("Contest updated successfully");
      return contest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        signOutAction.act();
      } else {
        alert.error("Error updating contest");
      }
    }
  }

  return useAction(updateContest);
}
