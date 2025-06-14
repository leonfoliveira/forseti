import { contestService, submissionService } from "@/app/_composition";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/submission/SubmissionPublicResponseDTO";
import { recalculateSubmissions } from "@/app/contests/[slug]/_util/submissions-calculator";
import { useToast } from "@/app/_component/context/notification-context";
import { useContestFormatter } from "@/app/_util/contest-formatter-hook";
import { useTranslations } from "next-intl";
import { useAuthorization } from "@/app/_component/context/authorization-context";
import { SubmissionAnswer } from "@/core/domain/enumerate/SubmissionAnswer";
import { SubmissionFullResponseDTO } from "@/core/repository/dto/response/submission/SubmissionFullResponseDTO";
import { UseLoadableStateReturnType } from "@/app/_util/loadable-state";
import { ContestContextType } from "@/app/contests/[slug]/_component/context/contest-context";
import { useContestMetadata } from "@/app/contests/[slug]/_component/context/contest-metadata-context";

export function useContestantDataFetcher(
  contestState: UseLoadableStateReturnType<ContestContextType>,
) {
  const contestMetadata = useContestMetadata();
  const { authorization } = useAuthorization();
  const toast = useToast();
  const { formatSubmissionAnswer } = useContestFormatter();

  const t = useTranslations(
    "contests.[slug].contestant._component.contestant-context",
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

  function subscribe() {
    return [
      submissionService.subscribeForMember(
        authorization?.member.id as string,
        receiveSubmission,
      ),
    ];
  }

  function receiveSubmission(submission: SubmissionPublicResponseDTO) {
    if (submission.answer === SubmissionAnswer.NO_ANSWER) {
      return;
    }

    contestState.finish((prev) => {
      return {
        ...prev,
        contestant: {
          ...prev.contestant,
          submissions: recalculateSubmissions(
            prev.contestant.submissions,
            submission,
          ),
          memberSubmissions: recalculateSubmissions(
            prev.contestant.memberSubmissions,
            submission,
          ),
        },
      };
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
      return {
        ...prev,
        contestant: {
          ...prev.contestant,
          memberSubmissions: recalculateSubmissions(
            prev.contestant.memberSubmissions,
            submission,
          ),
        },
      };
    });
  }

  return { fetch, subscribe };
}
