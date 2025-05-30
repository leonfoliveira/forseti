import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useFindAllContestsAction() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();

  async function findAllContests() {
    try {
      return await contestService.findAllContests();
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        await signOutAction.act();
      } else {
        alert.error("Error loading contests");
      }
    }
  }

  return useAction(findAllContests);
}
