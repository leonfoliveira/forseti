import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useMemberSignOutAction } from "@/app/_action/member-sign-out-action";

export function useFindAllProblemsForMemberAction() {
  const { contestService } = useContainer();
  const toast = useToast();
  const memberSignOutAction = useMemberSignOutAction();

  function findAllProblemsForMember(contestId: number) {
    try {
      return contestService.findAllProblemsForMember(contestId);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        memberSignOutAction.act(contestId);
      } else {
        toast.error("Error loading problems");
      }
    }
  }

  return useAction(findAllProblemsForMember);
}
