import { useAction } from "@/app/_util/action-hook";
import { SubmissionPublicResponseDTO } from "@/core/repository/dto/response/SubmissionPublicResponseDTO";
import { recalculatePublicSubmissions } from "@/app/contests/[id]/_util/submissions-calculator";
import { useEffect, useRef } from "react";
import { contestService, submissionService } from "@/app/_composition";
import { CompatClient } from "@stomp/stompjs";
import { useAlert } from "@/app/_component/alert/alert-provider";

export function useFindAllSubmissionsAction() {
  const alert = useAlert();
  const action = useAction(findAllSubmissions);
  const listenerRef = useRef<CompatClient>(null);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        submissionService.unsubscribe(listenerRef.current);
      }
    };
  }, []);

  async function findAllSubmissions(contestId: number) {
    try {
      const submissions = await contestService.findAllSubmissions(contestId);
      listenerRef.current = await submissionService.subscribeForContest(
        contestId,
        receiveSubmission,
      );
      return submissions;
    } catch {
      alert.error("Error loading submissions");
    }
  }

  function receiveSubmission(newSubmission: SubmissionPublicResponseDTO) {
    action.setData((data) => {
      return recalculatePublicSubmissions(data, newSubmission);
    });
  }

  return action;
}
