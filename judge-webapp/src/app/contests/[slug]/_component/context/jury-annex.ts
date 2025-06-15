import { contestService, submissionService } from "@/app/_composition";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { useToast } from "@/app/_component/context/notification-context";
import { useTranslations } from "next-intl";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";

/**
 * Hook to manage data and subscriptions for a jury user.
 */
export function useJuryAnnex(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const contestMetadata = useContestMetadata();
  const toast = useToast();
  const t = useTranslations("contests.[slug]._component.context.jury-annex");

  async function fetch() {
    const data = await Promise.all([
      contestService.findAllContestFullSubmissions(contestMetadata.id),
    ]);
    return {
      fullSubmissions: data[0],
    };
  }

  function subscribe() {
    return [
      submissionService.subscribeForContestFull(
        contestMetadata.id,
        receiveSubmission,
      ),
    ];
  }

  function receiveSubmission(submission: SubmissionFullResponseDTO) {
    contestState.finish((prev) => {
      return {
        ...prev,
        jury: {
          ...prev.jury,
          fullSubmissions: recalculateSubmissions(
            prev.jury.fullSubmissions,
            submission,
          ),
        },
      };
    });

    if (submission.status === SubmissionStatus.FAILED) {
      toast.error(t("submission-failed"));
    }
  }

  return { fetch, subscribe };
}
