import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { notFound } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";

export function useFindContestByIdForRoot() {
  const toast = useToast();
  const signOutAction = useRootSignOutAction();

  async function findContestById(id: number) {
    try {
      return await contestService.findContestByIdForRoot(id);
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
