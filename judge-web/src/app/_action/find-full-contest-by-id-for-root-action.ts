import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { useAction } from "@/app/_util/action-hook";
import { UnauthorizedException } from "@/core/domain/exception/UnauthorizedException";
import { ForbiddenException } from "@/core/domain/exception/ForbiddenException";
import { useRootSignOutAction } from "@/app/_action/root-sign-out-action";
import { contestService } from "@/app/_composition";
import { redirect } from "next/navigation";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useFindFullContestByIdForRoot() {
  const alert = useAlert();
  const signOutAction = useRootSignOutAction();
  const t = useTranslations("_action.find-contest-by-id-action");

  async function findFullContestById(id: string) {
    try {
      return await contestService.findFullContestById(id);
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

  return useAction(findFullContestById);
}
