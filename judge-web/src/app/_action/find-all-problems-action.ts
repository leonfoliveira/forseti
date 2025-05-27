import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { contestService } from "@/app/_composition";

export function useFindAllProblemsAction() {
  const toast = useToast();

  async function findAllProblems(contestId: number) {
    try {
      return await contestService.findAllProblems(contestId);
    } catch {
      toast.error("Error loading problems");
    }
  }

  return useAction(findAllProblems);
}
