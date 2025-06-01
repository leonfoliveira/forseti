import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useFindContestSummaryByIdAction() {
  const alert = useAlert();
  const t = useTranslations("_action.find-contest-summary-by-id-action");

  async function findContestById(id: number) {
    try {
      return await contestService.findContestSummaryById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(findContestById);
}
