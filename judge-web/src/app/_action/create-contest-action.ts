import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { useRouter } from "next/navigation";
import { contestService } from "@/app/_composition";

export function useCreateContestAction() {
  const toast = useToast();
  const signOutAction = useRootSignOutAction();
  const router = useRouter();

  async function createContest(input: CreateContestInputDTO) {
    try {
      const contest = await contestService.createContest(input);
      toast.success("Contest created successfully");
      router.push(`/root/contests/${contest.id}`);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await signOutAction.act();
      } else {
        toast.error("Error creating contest");
      }
    }
  }

  return useAction(createContest);
}
