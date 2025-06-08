import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";

export function useFindAllContestSubmissionsAction() {
  const alert = useAlert();
  const action = useAction(findAllContestSubmissions);
  const t = useTranslations("_action.find-all-submissions-action");

  async function findAllContestSubmissions(contestId: string) {
    try {
      return await contestService.findAllContestSubmissions(contestId);
    } catch {
      alert.error(t("error"));
    }
  }

  return action;
}
