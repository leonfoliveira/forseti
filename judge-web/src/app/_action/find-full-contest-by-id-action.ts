import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound } from "next/navigation";
import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";

export function useFindFullContestByIdAction() {
  const { contestService } = useContainer();
  const toast = useToast();
  const signOutAction = useRootSignOutAction();

  async function findContestById(id: number) {
    try {
      return await contestService.findFullContestById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        notFound();
      } else if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        signOutAction.act();
      } else {
        toast.error("Error loading contest");
      }
    }
  }

  return useAction(findContestById);
}
