import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";

export function useFindAllContestsAction() {
  const toast = useToast();
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
        toast.error("Error loading contests");
      }
    }
  }

  return useAction(findAllContests);
}
