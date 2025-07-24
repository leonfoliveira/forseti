import {
  announcementListener,
  clarificationListener,
  contestService,
  submissionListener,
} from "@/config/composition";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { SubmissionStatus } from "@/core/domain/enumerate/SubmissionStatus";
import { useAlert, useToast } from "@/app/_context/notification-context";
import { useTranslations } from "next-intl";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ClarificationResponseDTO } from "@/core/repository/dto/response/clarification/ClarificationResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

/**
 * Hook to manage data and subscriptions for a jury user.
 */
export function useJuryAnnex(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const alert = useAlert();

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

  function subscribe(listenerClient: ListenerClient) {
    return [
      submissionListener.subscribeForContestFull(
        listenerClient,
        contestMetadata.id,
        receiveSubmission,
      ),
      clarificationListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveClarification,
      ),
      announcementListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveAnnouncement,
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

  function receiveClarification(clarification: ClarificationResponseDTO) {
    if (clarification.parentId === undefined) {
      toast.info(t("clarification-toast-text"));
    }
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    alert.warning(announcement.text);
  }

  return { fetch, subscribe };
}
