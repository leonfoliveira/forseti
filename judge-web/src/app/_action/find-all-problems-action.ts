import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";

export function useFindAllProblemsAction() {
  const { contestService } = useContainer();
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
