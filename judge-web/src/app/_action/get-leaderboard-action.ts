import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { useSubmissionForContestListener } from "@/app/_listener/submission-for-contest-listener";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";
import { recalculateLeaderboard } from "@/app/contests/[id]/leaderboard/util/leaderboard-calculator";

export function useGetLeaderboardAction() {
  const { contestService } = useContainer();
  const submissionForContestListener = useSubmissionForContestListener();
  const toast = useToast();
  const action = useAction(getLeaderboard);

  async function getLeaderboard(contestId: number) {
    try {
      const leaderboard = await contestService.getLeaderboard(contestId);
      await submissionForContestListener.subscribe(contestId, onSubmission);
      return leaderboard;
    } catch {
      toast.error("Error loading leaderboard");
    }
  }

  function onSubmission(submission: SubmissionEmmitDTO) {
    action.setData((data) => {
      return recalculateLeaderboard(data, submission);
    });
  }

  return action;
}
