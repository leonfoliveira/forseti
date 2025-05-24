import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";

export function useFindAllProblemsAction() {
  const { contestService } = useContainer();
  const toast = useToast();

  function findAllProblems(contestId: number) {
    try {
      return contestService.findAllProblems(contestId);
    } catch {
      toast.error("Error loading problems");
    }
  }

  return useAction(findAllProblems);
}
