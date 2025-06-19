import {
  announcementListener,
  clarificationListener,
  contestService,
  submissionListener,
  submissionService
} from "@/app/_composition";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { useAlert, useToast } from "@/app/_component/context/notification-context";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";
import { merge } from "@/app/contests/[slug]/_util/entity-merger";
import { AnnouncementResponseDTO } from "@/core/repository/dto/response/announcement/AnnouncementResponseDTO";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

/**
 * Hook to manage data and subscriptions for a contestant dashboard.
 */
export function useContestantAnnex(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const contestMetadata = useContestMetadata();
  const { authorization } = useAuthorization();
  const alert = useAlert();
  const toast = useToast();
  const { formatSubmissionAnswer } = useContestFormatter();

  const t = useTranslations(
    "contests.[slug]._component.context.contestant-annex",
  );

  async function fetch(): Promise<ContestContextType["contestant"]> {
    const data = await Promise.all([
      contestService.findAllContestSubmissions(contestMetadata.id),
      submissionService.findAllFullForMember(),
    ]);
    return {
      submissions: data[0],
      memberSubmissions: data[1],
      addSubmission,
    };
  }

  function subscribe(listenerClient: ListenerClient) {
    return [
      submissionListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveContestSubmission,
      ),
      submissionListener.subscribeForMember(
        listenerClient,
        authorization!.member.id,
        receiveMemberSubmission,
      ),
      clarificationListener.subscribeForMemberChildren(
        listenerClient,
        authorization!.member.id,
        receiveClarificationChild,
      ),
      announcementListener.subscribeForContest(
        listenerClient,
        contestMetadata.id,
        receiveAnnouncement,
      ),
    ];
  }

  function receiveContestSubmission(submission: SubmissionPublicResponseDTO) {
    contestState.finish((prev) => {
      prev.contestant.submissions = merge(
        prev.contestant.submissions,
        submission,
      );
      return { ...prev };
    });
  }

  function receiveMemberSubmission(submission: SubmissionPublicResponseDTO) {
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    contestState.finish((prev) => {
      prev.contestant.memberSubmissions = merge(
        prev.contestant.memberSubmissions,
        submission,
      ) as SubmissionFullResponseDTO[];
      return { ...prev };
    });

    const text = t("submission-toast-problem", {
      letter: submission.problem.letter,
      answer: formatSubmissionAnswer(submission.answer),
    });

    switch (submission.answer) {
      case SubmissionAnswer.ACCEPTED: {
        toast.success(text);
        break;
      }
      case SubmissionAnswer.WRONG_ANSWER: {
        toast.error(text);
        break;
      }
      case SubmissionAnswer.TIME_LIMIT_EXCEEDED:
      case SubmissionAnswer.MEMORY_LIMIT_EXCEEDED: {
        toast.info(text);
        break;
      }
      case SubmissionAnswer.RUNTIME_ERROR:
      case SubmissionAnswer.COMPILATION_ERROR: {
        toast.warning(text);
        break;
      }
    }
  }

  function addSubmission(submission: SubmissionFullResponseDTO) {
    contestState.finish((prev) => {
      prev.contestant.memberSubmissions = merge(
        prev.contestant.memberSubmissions,
        submission,
      );
      return { ...prev };
    });
  }

  function receiveClarificationChild() {
    toast.info(t("clarification-toast-text"));
  }

  function receiveAnnouncement(announcement: AnnouncementResponseDTO) {
    alert.warning(announcement.text);
  }

  return { fetch, subscribe };
}
