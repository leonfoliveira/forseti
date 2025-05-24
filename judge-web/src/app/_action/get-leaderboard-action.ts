import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";

export function useGetLeaderboardAction() {
  const { contestService } = useContainer();
  const toast = useToast();

  async function getLeaderboard(id: number) {
    try {
      return await contestService.getLeaderboard(id);
    } catch {
      toast.error("Error loading leaderboard");
    }
  }

  return useAction(getLeaderboard);
}
