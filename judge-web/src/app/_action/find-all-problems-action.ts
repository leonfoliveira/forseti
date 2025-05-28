import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";
import { useAlert } from "@/app/_util/alert-hook";

export function useFindAllProblemsAction() {
  const alert = useAlert();

  async function findAllProblems(contestId: number) {
    try {
      return await contestService.findAllProblems(contestId);
    } catch {
      alert.error("Error loading problems");
    }
  }

  return useAction(findAllProblems);
}
