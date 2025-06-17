import { contestService, submissionListener } from "@/app/_composition";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

/**
 * Hook to manage data and subscriptions for a guest dashboard.
 */
export function useGuestAnnex(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const contestMetadata = useContestMetadata();

  async function fetch(): Promise<ContestContextType["guest"]> {
    const data = await Promise.all([
      contestService.findAllContestSubmissions(contestMetadata.id),
    ]);
    return {
      submissions: data[0] as SubmissionPublicResponseDTO[],
    };
  }

  function subscribe(client: ListenerClient) {
    return [
      submissionListener.subscribeForContest(
        client,
        contestMetadata.id,
        receiveSubmission,
      ),
    ];
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    contestState.finish((prevState) => {
      return {
        ...prevState,
        guest: {
          ...prevState.guest,
          submissions: recalculateSubmissions(
            prevState.guest.submissions,
            submission,
          ),
        },
      };
    });
  }

  return { fetch, subscribe };
}
