import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useFindAllProblemsAction() {
  const alert = useAlert();
  const t = useTranslations("_action.find-all-problems-action");

  async function findAllProblems(contestId: number) {
    try {
      return await contestService.findAllProblems(contestId);
    } catch {
      alert.error(t("error"));
    }
  }

  return useAction(findAllProblems);
}
