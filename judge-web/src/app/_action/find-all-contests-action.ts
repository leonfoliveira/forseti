import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";

export function useFindAllContestsAction() {
  const { contestService } = useContainer();
  const toast = useToast();
  const signOutAction = useRootSignOutAction();

  function findAllContests() {
    try {
      return contestService.findAllContests();
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      ) {
        signOutAction.act();
      } else {
        toast.error("Error loading contests");
      }
    }
  }

  return useAction(findAllContests);
}
