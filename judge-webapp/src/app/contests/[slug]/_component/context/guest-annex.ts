import {
  announcementListener,
  contestService,
  submissionListener,
} from "@/config/composition";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { useAlert } from "@/app/_context/notification-context";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

/**
 * Hook to manage data and subscriptions for a guest dashboard.
 */
export function useGuestAnnex(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const alert = useAlert();
  const contestMetadata = useContestMetadata();

  async function fetch(): Promise<ContestContextType["guest"]> {
    const data = await Promise.all([
      contestService.findAllContestSubmissions(contestMetadata.id),
    ]);
    return {
      submissions: data[0] as SubmissionPublicResponseDTO[],
    };
  }

  function subscribe(listenerClient: ListenerClient) {
    return [
      submissionListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveSubmission,
      ),
      announcementListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveAnnouncement,
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

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    alert.warning(announcement.text);
  }

  return { fetch, subscribe };
}
