import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { recalculatePublicSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useEffect, useRef } from "react";
import { contestService, submissionService } from "@/app/_composition";
import { useAlert } from "@/app/_component/alert/alert-provider";
import { useTranslations } from "next-intl";
import { ListenerClient } from "@/core/domain/model/ListenerClient";

export function useFindAllContestSubmissionsAction() {
  const alert = useAlert();
  const action = useAction(findAllContestSubmissions);
  const listenerRef = useRef<ListenerClient>(null);
  const t = useTranslations("_action.find-all-submissions-action");

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllContestSubmissions(contestId: string) {
    try {
      const submissions =
        await contestService.findAllContestSubmissions(contestId);
      listenerRef.current = await submissionService.subscribeForContest(
        contestId,
        receiveSubmission,
      );
      return submissions;
    } catch {
      alert.error(t("error"));
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    action.setData((data) => {
      return recalculatePublicSubmissions(data, newSubmission);
    });
  }

  return action;
}
