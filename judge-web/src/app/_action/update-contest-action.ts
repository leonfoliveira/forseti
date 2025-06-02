import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { UpdateContestInputDTO } from "@/core/service/dto/input/UpdateContestInputDTO";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";
import { validateTestCases } from "@/app/_util/test-cases-validator";

export function useUpdateContestAction() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();
  const t = useTranslations("_action.update-contest-action");

  async function updateContest(input: UpdateContestInputDTO) {
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
      const contest = await contestService.updateContest(input);
      alert.success(t("success"));
      return contest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        await signOutAction.act();
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(updateContest);
}
