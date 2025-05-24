import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { redirect } from "next/navigation";

export function useFindAllSubmissionsForMemberAction() {
  const { submissionService } = useContainer();
  const toast = useToast();

  async function findAllForMember(contestId: number) {
    try {
      return await submissionService.findAllForMember();
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        redirect(`/auth/contests/${contestId}`);
      } else {
        toast.error("Error loading submissions");
      }
    }
  }

  return useAction(findAllForMember);
}
