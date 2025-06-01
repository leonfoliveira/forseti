import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useFindAllContestsAction() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();
  const t = useTranslations("_action.find-all-contests-action");

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
        alert.error(t("error"));
      }
    }
  }

  return useAction(findAllContests);
}
