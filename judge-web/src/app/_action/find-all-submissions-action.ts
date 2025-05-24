import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";

export function useFindAllSubmissionsAction() {
  const { contestService } = useContainer();
  const toast = useToast();

  async function findAllSubmissions(contestId: number) {
    try {
      return await contestService.findAllSubmissions(contestId);
    } catch {
      toast.error("Error loading submissions");
    }
  }

  return useAction(findAllSubmissions);
}
