import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect, useRouter } from "next/navigation";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useDeleteContestAction() {
  const alert = useAlert();
  const router = useRouter();
  const t = useTranslations("_action.delete-contest-action");

  async function deleteContest(id: string) {
    try {
      await contestService.deleteContest(id);
      alert.success(t("success"));
      router.push(t("/root/contests"));
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else {
        alert.error(t("error"));
      }
    }
  }

  return useAction(deleteContest);
}
