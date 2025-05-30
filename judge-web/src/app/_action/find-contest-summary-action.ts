import { NotFoundException } from "@/core/domain/exception/NotFoundException";
import { redirect } from "next/navigation";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useFindContestSummaryByIdAction() {
  const alert = useAlert();

  async function findContestById(id: number) {
    try {
      return await contestService.findContestSummaryById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        redirect(`/not-found`);
      } else {
        alert.error("Error loading contest");
      }
    }
  }

  return useAction(findContestById);
}
