import { useContainer } from "@/app/_atom/container-atom";
import { useToast } from "@/app/_util/toast-hook";
import { useAction } from "@/app/_util/action-hook";
import { useSubmissionForContestListener } from "@/app/_listener/submission-for-contest-listener";
import { SubmissionEmmitDTO } from "@/core/listener/dto/emmit/SubmissionEmmitDTO";
import { recalculateSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";

export function useFindAllSubmissionsAction() {
  const { contestService } = useContainer();
  const submissionForContestListener = useSubmissionForContestListener();
  const toast = useToast();
  const action = useAction(findAllSubmissions);

  async function findAllSubmissions(contestId: number) {
    try {
      const submissions = await contestService.findAllSubmissions(contestId);
      await submissionForContestListener.subscribe(
        contestId,
        receiveSubmission,
      );
      return submissions;
    } catch {
      toast.error("Error loading submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionEmmitDTO) {
    action.setData((data) => {
      return recalculateSubmissions(data, newSubmission);
    });
  }

  return action;
}
