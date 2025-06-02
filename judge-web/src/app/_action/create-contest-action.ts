import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { CreateContestInputDTO } from "@/core/service/dto/input/CreateContestInputDTO";
import { useRouter } from "next/navigation";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";
import { validateTestCases } from "@/app/_util/test-cases-validator";

export function useCreateContestAction() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();
  const router = useRouter();
  const t = useTranslations("_action.create-contest-action");

  async function createContest(input: CreateContestInputDTO) {
    try {
      const validations = await Promise.all(
        input.problems.map((it) => validateTestCases(it.newTestCases)),
      );
      for (let i = 0; i < validations.length; i++) {
        if (!validations[i]) {
          alert.warning(t("test-cases-invalid", { problem: i }));
          return;
        }
      }
      const contest = await contestService.createContest(input);
      alert.success(t("success"));
      router.push(`/root/contests/${contest.id}`);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await signOutAction.act();
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(createContest);
}
